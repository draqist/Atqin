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
	"github.com/draqist/iqraa/backend/internal/data"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Config holds all the configuration for our application
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
}

// Application holds the dependencies for our HTTP handlers, helpers, and middleware.
type application struct {
	config config
	logger *log.Logger
	db     *sql.DB
	models data.Models
}

func main() {
	// 1. Declare our configuration
	var cfg config
	
    
    // 1. Read PORT from environment, default to 8080 if missing
    portStr := os.Getenv("PORT")
    if portStr == "" {
        portStr = "8080"
    }
    var err error
    cfg.port, err = strconv.Atoi(portStr)
    if err != nil {
        cfg.port = 8080
    }
	
	// This DSN (Data Source Name) matches your docker-compose environment variables
	// format: postgres://user:password@host:port/dbname
	cfg.db.dsn = os.Getenv("DB_DSN")
	cfg.supabase.url = os.Getenv("SUPABASE_URL")
    cfg.supabase.key = os.Getenv("SUPABASE_SERVICE_KEY")
	if cfg.db.dsn == "" {
		// Fallback for local testing outside docker if needed
		cfg.db.dsn = "postgres://user:password@localhost:5432/iqraa_db?sslmode=disable"
	}

	// 2. Initialize a structured logger
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	// 3. Connect to the Database
	db, err := openDB(cfg)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close() // Ensure DB closes when main() exits
	logger.Println("database connection pool established")

	// 4. Initialize the application struct
	app := &application{
		config: cfg,
		logger: logger,
		db:     db, // Inject the DB connection here
		models: data.NewModels(db),
	}

	// 5. Start the HTTP Server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(), // We will create this function next
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	logger.Printf("starting server on port %d", cfg.port)
	err = srv.ListenAndServe()
	logger.Fatal(err)
}

// openDB creates a connection pool to the database
func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("pgx", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	// Set connection pool settings (Critical for performance)
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	duration, _ := time.ParseDuration("15m")
	db.SetConnMaxIdleTime(duration)

	// Create a context with a 5-second timeout for the initial ping
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Ping the DB to ensure we actually have a connection
	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}