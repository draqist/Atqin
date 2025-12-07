package main

import (
	"net/http"
)

// routes defines the routing for the application.
// It sets up all the endpoints and applies necessary middleware.
func (app *application) routes() http.Handler {
	mux := http.NewServeMux()

	// Healthcheck
	mux.HandleFunc("GET /v1/health", app.healthcheckHandler)

	// --- PUBLIC ROUTES ---

	// Books
	mux.HandleFunc("GET /v1/books", app.listBooksHandler)
	mux.HandleFunc("GET /v1/books/{id}", app.showBookHandler)

	// Nodes (Book Content)
	mux.HandleFunc("POST /v1/books/{id}/nodes", app.createNodeHandler)
	mux.HandleFunc("GET /v1/books/{id}/nodes", app.listBookNodesHandler)

	// Notes (Public Feeds)
	mux.HandleFunc("GET /v1/books/{id}/notes/public", app.listPublicNotesHandler)
	mux.HandleFunc("GET /v1/notes/public/{id}", app.getPublicNoteHandler)
	mux.HandleFunc("GET /v1/notes/public", app.listAllPublicNotesHandler)

	// Authentication
	mux.HandleFunc("POST /v1/users/register", app.registerUserHandler)
	mux.HandleFunc("POST /v1/users/login", app.loginUserHandler)
	mux.HandleFunc("POST /v1/users/forgot-password", app.forgotPasswordHandler) // Added
	mux.HandleFunc("PUT /v1/users/reset-password", app.resetPasswordHandler)    // Added

	// Roadmaps (Public Read with Optional Auth)
	mux.HandleFunc("GET /v1/roadmaps", app.authenticateIfExists(app.listRoadmapsHandler))
	mux.HandleFunc("GET /v1/roadmaps/{id}", app.authenticateIfExists(app.getRoadmapHandler))

	// Waitlist
	mux.HandleFunc("POST /v1/waitlist", app.subscribeHandler)

	// Public Stats
	mux.HandleFunc("GET /v1/public/stats", app.getPublicStatsHandler)

	// --- PROTECTED ROUTES (Authenticated Users) ---

	// Notes
	mux.HandleFunc("GET /v1/books/{id}/note", app.requireAuth(app.getBookNoteHandler))
	mux.HandleFunc("PUT /v1/books/{id}/note", app.requireAuth(app.saveBookNoteHandler))

	// Bookmarks
	mux.HandleFunc("POST /v1/books/{id}/bookmark", app.requireAuth(app.toggleBookmarkHandler))
	mux.HandleFunc("GET /v1/bookmarks", app.requireAuth(app.listBookmarksHandler))

	// User Profile
	mux.HandleFunc("GET /v1/users/me", app.requireAuth(app.getMeHandler))
	mux.HandleFunc("GET /v1/users/search", app.requireAuth(app.searchUsersHandler))

	// Resources
	mux.HandleFunc("GET /v1/resources/{id}", app.requireAuth(app.getResourceHandler))
	mux.HandleFunc("GET /v1/books/{id}/resources", app.listBookResourcesHandler)

	// Roadmaps (Progress)
	mux.HandleFunc("POST /v1/roadmaps/nodes/{node_id}/progress", app.requireAuth(app.updateRoadmapProgressHandler))

	// Analytics
	mux.HandleFunc("POST /v1/analytics/heartbeat", app.requireAuth(app.trackActivityHandler))
	mux.HandleFunc("GET /v1/analytics/stats", app.requireAuth(app.getStudentStatsHandler))

	// Social (Cohorts & Partners)
	mux.HandleFunc("POST /v1/roadmaps/{id}/join", app.requireAuth(app.joinCohortHandler))
	mux.HandleFunc("GET /v1/partners", app.requireAuth(app.getPartnerHandler))
	mux.HandleFunc("POST /v1/partners/invite", app.requireAuth(app.invitePartnerHandler))
	mux.HandleFunc("POST /v1/partners/accept", app.requireAuth(app.acceptPartnerHandler))

	// Notifications
	mux.HandleFunc("GET /v1/notifications", app.requireAuth(app.listNotificationsHandler))
	mux.HandleFunc("PUT /v1/notifications/{id}/read", app.requireAuth(app.markNotificationReadHandler))
	mux.HandleFunc("POST /v1/notifications/read-all", app.requireAuth(app.markAllNotificationsReadHandler))

	// --- ADMIN ROUTES (Admin Only) ---

	// Books Management
	mux.HandleFunc("POST /v1/books", app.requireAuth(app.requireAdmin(app.createBookHandler)))
	mux.HandleFunc("PUT /v1/books/{id}", app.requireAuth(app.requireAdmin(app.updateBookHandler)))
	mux.HandleFunc("POST /v1/books/{id}/progress", app.requireAuth(app.saveProgressHandler)) // Note: This seems misplaced, usually user-specific?
	mux.HandleFunc("DELETE /v1/books/{id}", app.requireAuth(app.requireAdmin(app.deleteBookHandler)))
	mux.HandleFunc("POST /v1/books/{id}/nodes/batch", app.requireAuth(app.requireAdmin(app.batchCreateNodesHandler)))

	// Resources Management
	mux.HandleFunc("GET /v1/resources", app.requireAuth(app.requireAdmin(app.listAllResourcesHandler)))
	mux.HandleFunc("POST /v1/resources", app.requireAuth(app.requireAdmin(app.createResourceHandler)))
	mux.HandleFunc("PUT /v1/resources/{id}", app.requireAuth(app.requireAdmin(app.updateResourceHandler)))
	mux.HandleFunc("DELETE /v1/resources/{id}", app.requireAuth(app.requireAdmin(app.deleteResourceHandler)))

	// Roadmaps Management
	mux.HandleFunc("POST /v1/roadmaps", app.requireAuth(app.requireAdmin(app.createRoadmapHandler)))
	mux.HandleFunc("PUT /v1/roadmaps/{id}", app.requireAuth(app.requireAdmin(app.updateRoadmapHandler)))
	mux.HandleFunc("DELETE /v1/roadmaps/{id}", app.requireAuth(app.requireAdmin(app.deleteRoadmapHandler)))
	mux.HandleFunc("POST /v1/roadmaps/{id}/nodes", app.requireAuth(app.requireAdmin(app.addRoadmapNodeHandler)))
	mux.HandleFunc("PUT /v1/roadmaps/nodes/{node_id}", app.requireAuth(app.requireAdmin(app.updateRoadmapNodeHandler)))
	mux.HandleFunc("DELETE /v1/roadmaps/nodes/{node_id}", app.requireAuth(app.requireAdmin(app.deleteRoadmapNodeHandler)))
	mux.HandleFunc("PUT /v1/roadmaps/{id}/nodes/reorder", app.requireAuth(app.requireAdmin(app.batchUpdateRoadmapNodesHandler)))

	// Admin Tools & Stats
	mux.HandleFunc("POST /v1/uploads/sign", app.requireAuth(app.requireAdmin(app.generateUploadURLHandler)))
	mux.HandleFunc("POST /v1/tools/youtube-playlist", app.requireAuth(app.requireAdmin(app.fetchYouTubePlaylistHandler)))
	mux.HandleFunc("GET /v1/tools/youtube-search", app.requireAuth(app.requireAdmin(app.searchYouTubePlaylistsHandler)))
	mux.HandleFunc("GET /v1/admin/stats", app.requireAuth(app.requireAdmin(app.getSystemStatsHandler)))
	mux.HandleFunc("POST /v1/admin/tools/extract-pdf", app.requireAuth(app.requireAdmin(app.extractPdfContentHandler)))
	mux.HandleFunc("PATCH /v1/features/{id}/status", app.requireAuth(app.requireAdmin(app.updateFeatureStatusHandler)))

	// Feature Requests
	mux.HandleFunc("GET /v1/features", app.listFeatureRequestsHandler)
	mux.HandleFunc("POST /v1/features", app.requireAuth(app.createFeatureRequestHandler))
	mux.HandleFunc("POST /v1/features/{id}/vote", app.requireAuth(app.voteFeatureRequestHandler))

	return app.enableCORS(mux)
}