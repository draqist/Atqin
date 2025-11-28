package main

import (
	"encoding/json"
	"net/http"
)

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
		// Analytics should fail silently, don't break the user app
		return 
	}

	// Fire and forget (don't block response)
	go func() {
		app.models.Analytics.LogActivity(userID, input.BookID, input.Minutes)
	}()

	w.WriteHeader(http.StatusOK)
}

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