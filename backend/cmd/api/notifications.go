package main

import (
	"encoding/json"
	"net/http"
)

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
