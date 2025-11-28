package main

// import (
// 	"encoding/json"
// 	"net/http"
// )

// // joinCohortHandler assigns a user to a cohort for a specific roadmap
// func (app *application) joinCohortHandler(w http.ResponseWriter, r *http.Request) {
// 	roadmapID := r.PathValue("id")
// 	userID, ok := r.Context().Value(UserContextKey).(string)
// 	if !ok || userID == "" {
// 		app.errorResponse(w, http.StatusUnauthorized, "Authentication required")
// 		return
// 	}

// 	var input struct {
// 		Pace string `json:"pace"` // 'casual', 'dedicated', 'intensive'
// 	}
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
// 		return
// 	}

// 	// Validate Pace
// 	validPaces := map[string]bool{"casual": true, "dedicated": true, "intensive": true}
// 	if !validPaces[input.Pace] {
// 		app.errorResponse(w, http.StatusBadRequest, "Invalid pace. Must be casual, dedicated, or intensive.")
// 		return
// 	}

// 	// 1. Find or Create the Cohort
// 	cohort, err := app.models.Social.GetOrCreateCohort(roadmapID, input.Pace)
// 	if err != nil {
// 		app.logger.Println(err)
// 		app.errorResponse(w, http.StatusInternalServerError, "Failed to find cohort")
// 		return
// 	}

// 	// 2. Add User to Cohort
// 	err = app.models.Social.JoinCohort(cohort.ID, userID)
// 	if err != nil {
// 		app.logger.Println(err)
// 		app.errorResponse(w, http.StatusInternalServerError, "Failed to join cohort")
// 		return
// 	}

// 	// 3. Return Success with Cohort Details
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]any{
// 		"message":   "Joined cohort successfully",
// 		"cohort_id": cohort.ID,
// 		"pace":      cohort.Pace,
// 	})
// }