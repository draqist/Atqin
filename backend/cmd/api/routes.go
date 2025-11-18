package main

import (
	"net/http"
)

func (app *application) routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", app.healthcheckHandler)

	// Books
	mux.HandleFunc("POST /v1/books", app.createBookHandler)
	mux.HandleFunc("GET /v1/books", app.listBooksHandler)      // NEW: List all
	mux.HandleFunc("GET /v1/books/{id}", app.showBookHandler)  // NEW: Get one

	// Nodes (Content)
	mux.HandleFunc("POST /v1/books/{id}/nodes", app.createNodeHandler)
	mux.HandleFunc("GET /v1/books/{id}/nodes", app.listBookNodesHandler) // NEW: Get content

	return mux
}