package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	// Import the pgx driver for Postgres
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/draqist/iqraa/backend/internal/data"
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
	cfg.port = 8080
	
	// This DSN (Data Source Name) matches your docker-compose environment variables
	// format: postgres://user:password@host:port/dbname
	cfg.db.dsn = os.Getenv("DB_DSN")
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