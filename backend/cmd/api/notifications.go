package main

import (
	"encoding/json"
	"net/http"
)

// listNotificationsHandler retrieves all notifications for the authenticated user.
// GET /v1/notifications
func (app *application) listNotificationsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserContextKey).(string)

	notifications, err := app.models.Notifications.GetForUser(userID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch notifications")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// markNotificationReadHandler marks a specific notification as read.
// PUT /v1/notifications/{id}/read
func (app *application) markNotificationReadHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserContextKey).(string)
	id := r.PathValue("id")

	err := app.models.Notifications.MarkRead(id, userID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to mark as read")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "marked as read"}`))
}

// markAllNotificationsReadHandler marks all notifications for the user as read.
// POST /v1/notifications/read-all
func (app *application) markAllNotificationsReadHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserContextKey).(string)

	err := app.models.Notifications.MarkAllRead(userID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to mark all as read")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "all marked as read"}`))
}
