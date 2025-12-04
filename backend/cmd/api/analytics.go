package main

import (
	"encoding/json"
	"net/http"
)

// trackActivityHandler records user activity (e.g., reading time) for a specific book.
// POST /v1/analytics/heartbeat
func (app *application) trackActivityHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		BookID  string `json:"book_id"`
		Minutes int    `json:"minutes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		return
	}

	go func() {
		app.models.Analytics.LogActivity(userID, input.BookID, input.Minutes)
	}()

	w.WriteHeader(http.StatusOK)
}

// getStudentStatsHandler retrieves analytics statistics for the authenticated student.
// GET /v1/analytics/stats
func (app *application) getStudentStatsHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	stats, err := app.models.Analytics.GetStudentStats(userID)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch stats")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// getSystemStatsHandler retrieves system-wide statistics for the admin dashboard.
// GET /v1/admin/stats
func (app *application) getSystemStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := app.models.Analytics.GetDashboardData()
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch system stats")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// getPublicStatsHandler retrieves public statistics for the landing page.
// GET /v1/public/stats
func (app *application) getPublicStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := app.models.Analytics.GetSystemStats()
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch public stats")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}