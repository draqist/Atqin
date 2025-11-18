package main

import (
	"net/http"
)

func (app *application) routes() http.Handler { // Change return type to http.Handler
	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", app.healthcheckHandler)

	// Books
	mux.HandleFunc("POST /v1/books", app.createBookHandler)
	mux.HandleFunc("GET /v1/books", app.listBooksHandler)
	mux.HandleFunc("GET /v1/books/{id}", app.showBookHandler)

	// Nodes
	mux.HandleFunc("POST /v1/books/{id}/nodes", app.createNodeHandler)
	mux.HandleFunc("GET /v1/books/{id}/nodes", app.listBookNodesHandler)

	// WRAP the mux with the CORS middleware
	return app.enableCORS(mux)
}