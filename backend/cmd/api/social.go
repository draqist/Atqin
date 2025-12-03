package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// joinCohortHandler assigns a user to a cohort for a specific roadmap.
// POST /v1/roadmaps/{id}/join
func (app *application) joinCohortHandler(w http.ResponseWriter, r *http.Request) {
	roadmapID := r.PathValue("id")
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var input struct {
		Pace string `json:"pace"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	validPaces := map[string]bool{"casual": true, "dedicated": true, "intensive": true}
	if !validPaces[input.Pace] {
		app.errorResponse(w, http.StatusBadRequest, "Invalid pace. Must be casual, dedicated, or intensive.")
		return
	}

	cohort, err := app.models.Social.GetOrCreateCohort(roadmapID, input.Pace)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to find cohort")
		return
	}

	err = app.models.Social.JoinCohort(cohort.ID, userID)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to join cohort")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message":   "Joined cohort successfully",
		"cohort_id": cohort.ID,
		"pace":      cohort.Pace,
	})
}

// getPartnerHandler retrieves the current accountability partner for the user.
// GET /v1/partners
func (app *application) getPartnerHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	partner, err := app.models.Social.GetPartner(userID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to get partner")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"partner": partner,
	})
}

// invitePartnerHandler sends a partnership invitation to another user.
// POST /v1/partners/invite
func (app *application) invitePartnerHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		TargetUserID string `json:"target_user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	err := app.models.Social.InvitePartner(userID, input.TargetUserID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to invite partner")
		return
	}

	app.models.Notifications.Insert(&data.Notification{
		UserID:  input.TargetUserID,
		Type:    "partner_invite",
		Title:   "New Partner Request",
		Message: "Someone wants to be your accountability partner!",
		Data:    json.RawMessage(`{}`),
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Invite sent"}`))
}

// acceptPartnerHandler accepts a pending partnership invitation.
// POST /v1/partners/accept
func (app *application) acceptPartnerHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		PartnerID string `json:"partner_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	err := app.models.Social.AcceptPartner(userID, input.PartnerID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to accept invite")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Partner accepted"}`))
}