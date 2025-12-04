package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// listFeatureRequestsHandler retrieves all feature requests with vote status for the current user.
// GET /v1/features
func (app *application) listFeatureRequestsHandler(w http.ResponseWriter, r *http.Request) {
	// Try to get user ID if authenticated, but don't require it
	var userID string
	userContext := r.Context().Value(UserContextKey)
	if userContext != nil {
		userID = userContext.(string)
	}

	features, err := app.models.Features.GetAll(userID)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch feature requests")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(features)
}

// createFeatureRequestHandler allows a user to submit a new feature request.
// POST /v1/features
func (app *application) createFeatureRequestHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if input.Title == "" || input.Description == "" {
		app.errorResponse(w, http.StatusBadRequest, "Title and description are required")
		return
	}

	request := &data.FeatureRequest{
		Title:       input.Title,
		Description: input.Description,
		UserID:      userID,
	}

	err := app.models.Features.Insert(request)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create feature request")
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(request)
}

// voteFeatureRequestHandler toggles a vote for a feature request.
// POST /v1/features/{id}/vote
func (app *application) voteFeatureRequestHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := r.PathValue("id")
	if id == "" {
		app.errorResponse(w, http.StatusBadRequest, "Missing feature ID")
		return
	}

	err := app.models.Features.Vote(userID, id)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to vote")
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// updateFeatureStatusHandler allows admins to update the status of a feature request.
// PATCH /v1/features/{id}/status
func (app *application) updateFeatureStatusHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	id := r.PathValue("id")
	if id == "" {
		app.errorResponse(w, http.StatusBadRequest, "Missing feature ID")
		return
	}

	err := app.models.Features.UpdateStatus(id, input.Status)
	if err != nil {
		if err == data.ErrRecordNotFound {
			app.errorResponse(w, http.StatusNotFound, "Feature request not found")
		} else {
			app.logger.Println(err)
			app.errorResponse(w, http.StatusInternalServerError, "Failed to update status")
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}
