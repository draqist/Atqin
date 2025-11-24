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
	mux.HandleFunc("GET /v1/books/{id}/resources", app.listBookResourcesHandler)
	// Nodes
	mux.HandleFunc("POST /v1/books/{id}/nodes", app.createNodeHandler)
	mux.HandleFunc("GET /v1/books/{id}/nodes", app.listBookNodesHandler)

// Notes
// Public Community Feed
mux.HandleFunc("GET /v1/books/{id}/notes/public", app.listPublicNotesHandler)


// GLOBAL FEED
mux.HandleFunc("GET /v1/notes/public", app.listAllPublicNotesHandler)

mux.HandleFunc("POST /v1/users/register", app.registerUserHandler)
	mux.HandleFunc("POST /v1/users/login", app.loginUserHandler)

	// --- PROTECTED ROUTES ---
	// We wrap these with app.requireAuth(...)
	
	// Notes (Now Protected)
	mux.HandleFunc("GET /v1/books/{id}/note", app.requireAuth(app.getBookNoteHandler))
	mux.HandleFunc("PUT /v1/books/{id}/note", app.requireAuth(app.saveBookNoteHandler))
	
	// Bookmarks (Now Protected)
	mux.HandleFunc("POST /v1/books/{id}/bookmark", app.requireAuth(app.toggleBookmarkHandler))
	mux.HandleFunc("GET /v1/bookmarks", app.requireAuth(app.listBookmarksHandler))
	// User Profile
mux.HandleFunc("GET /v1/users/me", app.requireAuth(app.getMeHandler))
	// WRAP the mux with the CORS middleware
	return app.enableCORS(mux)
}