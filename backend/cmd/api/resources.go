package main

import (
	"encoding/json"
	"net/http"
)

// listBookResourcesHandler handles GET /v1/books/{id}/resources
func (app *application) listBookResourcesHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Get the book ID from the URL
	bookID := r.PathValue("id")

	// 2. Call the Model (The Chef)
	resources, err := app.models.Resources.GetByBookID(bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 3. Send the JSON response (Serve the food)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}