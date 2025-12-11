package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	// Import the pgx driver for Postgres
	"github.com/draqist/iqraa/backend/internal/cache"
	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/mailer" // Added
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
	config config
	logger *log.Logger
	db     *sql.DB
	models data.Models
	mailer mailer.Mailer
	hub    *Hub
}

// main is the entry point of the application.
// It initializes configuration, logger, database connection, and starts the HTTP server.
func main() {
	var cfg config

	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}
	var err error
	cfg.port, err = strconv.Atoi(portStr)
	if err != nil {
		cfg.port = 8080
	}
	redisURL := os.Getenv("REDIS_URL")
    if redisURL == "" {
        // Fallback for local dev if you don't have internet
        redisURL = "redis://localhost:6379" 
    }
    
    // 2. Connect
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

	cacheSvc, err := cache.New(redisURL)
	if err != nil {
			logger.Fatal(err) // Fail fast if cache is broken
	}

	db, err := openDB(cfg)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()
	logger.Println("database connection pool established")
	models:= data.NewModels(db, cacheSvc)
	app := &application{
		config: cfg,
		logger: logger,
		db:     db,
		models: models,
		mailer: mailer.New(cfg.smtp.host, cfg.smtp.port, cfg.smtp.username, cfg.smtp.password, cfg.smtp.sender),
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

	logger.Printf("starting server on port %d", cfg.port)
	err = srv.ListenAndServe()
	logger.Fatal(err)
}

// openDB creates a connection pool to the database with configured settings.
func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("pgx", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	duration, _ := time.ParseDuration("15m")
	db.SetConnMaxIdleTime(duration)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}