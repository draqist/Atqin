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
	mux.HandleFunc("POST /v1/books/{id}/progress", app.requireAuth(app.saveProgressHandler))
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
	mux.HandleFunc("GET /v1/users/search", app.requireAuth(app.searchUsersHandler))
// Inside protected routes, or public if you prefer
mux.HandleFunc("GET /v1/resources/{id}", app.requireAuth(app.getResourceHandler))
// In routes.go
mux.HandleFunc("GET /v1/books/{id}/resources", app.listBookResourcesHandler)
// Add inside requireAdmin block
mux.HandleFunc("POST /v1/uploads/sign", app.requireAuth(app.requireAdmin(app.generateUploadURLHandler)))
// ROADMAPS (Public Read)
	// Note: We wrap getRoadmapHandler in requireAuth *Optionally* if we want progress, 
    // or we handle the empty context inside the handler (which we did above). 
    // Actually, to support Guest viewing, don't wrap GetBySlug in requireAuth, 
    // instead use a middleware that "Extracts User if Present" but doesn't block.
    
    // For simplicity now: Public routes
	mux.HandleFunc("GET /v1/roadmaps", app.authenticateIfExists(app.listRoadmapsHandler))
    
    // We use a special wrapper or just let the handler check headers manually if you want hybrid auth
    // For now, let's assume we just use the handler and if no token, no progress shown.
    // You might need a middleware "authenticateIfExists"
	// mux.HandleFunc("GET /v1/roadmaps/{slug}", app.authenticateIfExists(app.getRoadmapHandler))

	// ROADMAPS (Protected Write)
	mux.HandleFunc("POST /v1/roadmaps/nodes/{node_id}/progress", app.requireAuth(app.updateRoadmapProgressHandler))
	// --- ROADMAPS (ADMIN) ---
	
	// 1. Container Management
	mux.HandleFunc("POST /v1/roadmaps", app.requireAuth(app.requireAdmin(app.createRoadmapHandler)))
	mux.HandleFunc("PUT /v1/roadmaps/{id}", app.requireAuth(app.requireAdmin(app.updateRoadmapHandler)))
	mux.HandleFunc("DELETE /v1/roadmaps/{id}", app.requireAuth(app.requireAdmin(app.deleteRoadmapHandler)))

	// 2. Node Management (Adding Books to Roadmap)
	mux.HandleFunc("POST /v1/roadmaps/{id}/nodes", app.requireAuth(app.requireAdmin(app.addRoadmapNodeHandler)))
	mux.HandleFunc("PUT /v1/roadmaps/nodes/{node_id}", app.requireAuth(app.requireAdmin(app.updateRoadmapNodeHandler)))
	mux.HandleFunc("DELETE /v1/roadmaps/nodes/{node_id}", app.requireAuth(app.requireAdmin(app.deleteRoadmapNodeHandler)))
	// PUT /v1/roadmaps/{id}/nodes/reorder
mux.HandleFunc("PUT /v1/roadmaps/{id}/nodes/reorder", app.requireAuth(app.requireAdmin(app.batchUpdateRoadmapNodesHandler)))
// ANALYTICS (Protected)
mux.HandleFunc("POST /v1/analytics/heartbeat", app.requireAuth(app.trackActivityHandler))
mux.HandleFunc("GET /v1/analytics/stats", app.requireAuth(app.getStudentStatsHandler))
// SOCIAL (Protected)
mux.HandleFunc("POST /v1/roadmaps/{id}/join", app.requireAuth(app.joinCohortHandler))
mux.HandleFunc("GET /v1/partners", app.requireAuth(app.getPartnerHandler))
mux.HandleFunc("POST /v1/partners/invite", app.requireAuth(app.invitePartnerHandler))
mux.HandleFunc("POST /v1/partners/accept", app.requireAuth(app.acceptPartnerHandler))

// NOTIFICATIONS (Protected)
mux.HandleFunc("GET /v1/notifications", app.requireAuth(app.listNotificationsHandler))
mux.HandleFunc("PUT /v1/notifications/{id}/read", app.requireAuth(app.markNotificationReadHandler))
mux.HandleFunc("POST /v1/notifications/read-all", app.requireAuth(app.markAllNotificationsReadHandler))
// Admin Only
mux.HandleFunc("POST /v1/tools/youtube-playlist", app.requireAuth(app.requireAdmin(app.fetchYouTubePlaylistHandler)))
// Admin Tool
mux.HandleFunc("GET /v1/tools/youtube-search", app.requireAuth(app.requireAdmin(app.searchYouTubePlaylistsHandler)))
// ... inside admin routes ...
mux.HandleFunc("GET /v1/admin/stats", app.requireAuth(app.requireAdmin(app.getSystemStatsHandler)))
mux.HandleFunc("POST /v1/admin/tools/extract-pdf", app.requireAuth(app.requireAdmin(app.extractPdfContentHandler)))
	mux.HandleFunc("POST /v1/books/{id}/nodes/batch", app.requireAuth(app.requireAdmin(app.batchCreateNodesHandler)))
	
	// Waitlist
	mux.HandleFunc("POST /v1/waitlist", app.subscribeHandler)

	// WRAP the mux with the CORS middleware
	return app.enableCORS(mux)
}