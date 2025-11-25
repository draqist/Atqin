package main

import (
	"net/http"
)

func (app *application) routes() http.Handler { // Change return type to http.Handler
	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/health", app.healthcheckHandler)

	// Books
	mux.HandleFunc("GET /v1/books", app.listBooksHandler)
	mux.HandleFunc("GET /v1/books/{id}", app.showBookHandler)
	// Nodes
	mux.HandleFunc("POST /v1/books/{id}/nodes", app.createNodeHandler)
	mux.HandleFunc("GET /v1/books/{id}/nodes", app.listBookNodesHandler)

// Notes
// Public Community Feed
mux.HandleFunc("GET /v1/books/{id}/notes/public", app.listPublicNotesHandler)

mux.HandleFunc("GET /v1/notes/public/{id}", app.getPublicNoteHandler)

// GLOBAL FEED
mux.HandleFunc("GET /v1/notes/public", app.listAllPublicNotesHandler)

mux.HandleFunc("POST /v1/users/register", app.registerUserHandler)
	mux.HandleFunc("POST /v1/users/login", app.loginUserHandler)

	// --- PROTECTED ROUTES ---
	// We wrap these with app.requireAuth(...)
	
	// Notes (Now Protected)
	mux.HandleFunc("GET /v1/books/{id}/note", app.requireAuth(app.getBookNoteHandler))
	mux.HandleFunc("PUT /v1/books/{id}/note", app.requireAuth(app.saveBookNoteHandler))
	// Add to protected routes
// Only Admins can WRITE (POST/PUT)
	mux.HandleFunc("POST /v1/books", app.requireAuth(app.requireAdmin(app.createBookHandler)))
	mux.HandleFunc("PUT /v1/books/{id}", app.requireAuth(app.requireAdmin(app.updateBookHandler)))
	// ... other book routes ...
	
	// Only Admins can DELETE
	mux.HandleFunc("DELETE /v1/books/{id}", app.requireAuth(app.requireAdmin(app.deleteBookHandler)))
	// --- RESOURCES (ADMIN) ---
    // Anyone can READ
	// ... Existing routes

	// --- RESOURCES (ADMIN) ---
	// LIST ALL (For Admin Table)
	mux.HandleFunc("GET /v1/resources", app.requireAuth(app.requireAdmin(app.listAllResourcesHandler)))
	
	// CREATE
	mux.HandleFunc("POST /v1/resources", app.requireAuth(app.requireAdmin(app.createResourceHandler)))
	
	// UPDATE & DELETE
	mux.HandleFunc("PUT /v1/resources/{id}", app.requireAuth(app.requireAdmin(app.updateResourceHandler)))
	mux.HandleFunc("DELETE /v1/resources/{id}", app.requireAuth(app.requireAdmin(app.deleteResourceHandler)))
	// Bookmarks (Now Protected)
	mux.HandleFunc("POST /v1/books/{id}/bookmark", app.requireAuth(app.toggleBookmarkHandler))
	mux.HandleFunc("GET /v1/bookmarks", app.requireAuth(app.listBookmarksHandler))
	// User Profile
mux.HandleFunc("GET /v1/users/me", app.requireAuth(app.getMeHandler))
// Inside protected routes, or public if you prefer
mux.HandleFunc("GET /v1/resources/{id}", app.requireAuth(app.getResourceHandler))
	// WRAP the mux with the CORS middleware
	return app.enableCORS(mux)
}