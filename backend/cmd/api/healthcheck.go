package main

import (
	"net/http"
)

// healthcheckHandler returns the status of the application.
func (app *application) healthcheckHandler(w http.ResponseWriter, r *http.Request) {
	data := `{"status": "available", "environment": "development", "version": "1.0.0"}`

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(data))
}