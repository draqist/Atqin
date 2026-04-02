package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	// Import the pgx driver for Postgres
	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/draqist/iqraa/backend/internal/cache"
	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/mailer"
	"github.com/draqist/iqraa/backend/internal/storage"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Config holds all the configuration for our application.
type config struct {
	port int
	db   struct {
		dsn          string
		maxOpenConns int
		maxIdleConns int
		maxIdleTime  string
	}
	supabase struct {
		url string
		key string
	}
	smtp struct {
		host     string
		port     int
		username string
		password string
		sender   string
	}
}

// Application holds the dependencies for our HTTP handlers, helpers, and middleware.
type application struct {
	config  config
	logger  *log.Logger
	db      *sql.DB
	models  data.Models
	mailer  mailer.Mailer
	hub     *Hub
	storage *storage.R2Service
}

// main is the entry point of the application.
// It initializes configuration, logger, database connection, and starts the HTTP server.
func main() {
	var cfg config

	r2AccountID := os.Getenv("R2_ACCOUNT_ID")
	r2AccessKey := os.Getenv("R2_ACCESS_KEY_ID")
	r2SecretKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	r2Bucket := "iqraa-assets"
	r2Domain := "https://media.iqraa.space"

	// Load AWS config with credentials
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(r2AccessKey, r2SecretKey, "")),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
	}

	// Create S3 Client for R2 with BaseEndpoint
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", r2AccountID))
	})

	// Initialize R2Service
	r2Service := &storage.R2Service{
		Client:       s3Client,
		Bucket:       r2Bucket,
		PublicDomain: r2Domain,
	}

	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}

	cfg.port, err = strconv.Atoi(portStr)
	if err != nil {
		cfg.port = 8080
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	cfg.db.dsn = os.Getenv("DB_DSN")
	cfg.supabase.url = os.Getenv("SUPABASE_URL")
	cfg.supabase.key = os.Getenv("SUPABASE_SERVICE_KEY")
	if cfg.db.dsn == "" {
		cfg.db.dsn = "postgres://user:password@localhost:5432/iqraa_db?sslmode=disable"
	}

	cfg.smtp.host = os.Getenv("SMTP_HOST")
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	cfg.smtp.port = port
	cfg.smtp.username = os.Getenv("SMTP_USERNAME")
	cfg.smtp.password = os.Getenv("SMTP_PASSWORD")
	cfg.smtp.sender = os.Getenv("SMTP_SENDER")

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	// Fix 3: Redis failure is a warning, not a fatal crash.
	// The app degrades gracefully (no caching) rather than crash-looping on Render.
	cacheSvc, err := cache.New(redisURL)
	if err != nil {
		logger.Printf("WARNING: Redis unavailable, caching disabled: %v", err)
		cacheSvc = nil
	}

	db, err := openDB(cfg)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Println("database connection pool established")

	models := data.NewModels(db, cacheSvc)
	app := &application{
		config: cfg,
		logger: logger,
		db:     db,
		models: models,
		mailer: mailer.New(cfg.smtp.host, cfg.smtp.port, cfg.smtp.username, cfg.smtp.password, cfg.smtp.sender),
		storage: r2Service,
	}

	// Initialize and run WebSocket Hub
	app.hub = newHub(app)
	go app.hub.run()

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Fix 6: Graceful shutdown — handle SIGTERM sent by Render during deploys.
	// Without this, in-flight requests are dropped abruptly on every redeploy.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		logger.Printf("starting server on port %d", cfg.port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal(err)
		}
	}()

	<-quit
	logger.Println("shutting down server gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatalf("server forced to shutdown: %v", err)
	}
	logger.Println("server exited cleanly")
}

// openDB creates a connection pool to the database with configured settings.
// Pool sizes are tuned for Render's 512MB free tier (each idle conn ~5-10MB).
func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("pgx", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	// Fix 5: Reduced pool from 25/25 to 10/3 for 512MB memory constraint.
	// 25 idle connections could consume ~250MB. This keeps it well under budget.
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(3)
	db.SetConnMaxIdleTime(15 * time.Minute)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}