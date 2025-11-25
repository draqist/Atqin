package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// createResourceHandler
func (app *application) createResourceHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		BookID        string  `json:"book_id"`
		Type          string  `json:"type"`
		Title         string  `json:"title"`
		URL           string  `json:"url"`
		IsOfficial    bool    `json:"is_official"`
		ParentID      *string `json:"parent_id"`
		SequenceIndex int     `json:"sequence_index"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	resource := &data.Resource{
		BookID:        input.BookID,
		Type:          input.Type,
		Title:         input.Title,
		URL:           input.URL,
		IsOfficial:    input.IsOfficial,
		ParentID:      input.ParentID,
		SequenceIndex: input.SequenceIndex,
	}

	err := app.models.Resources.Insert(resource)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create resource")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}

// listAllResourcesHandler (For Admin Table)
func (app *application) listAllResourcesHandler(w http.ResponseWriter, r *http.Request) {
	resources, err := app.models.Resources.GetAll()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch resources")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}

// deleteResourceHandler
func (app *application) deleteResourceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := app.models.Resources.Delete(id)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			app.errorResponse(w, http.StatusNotFound, "Resource not found")
		} else {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to delete")
		}
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"deleted"}`))
}

// updateResourceHandler
func (app *application) updateResourceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	
	resource, err := app.models.Resources.Get(id)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "Resource not found")
		return
	}

	var input struct {
		Title         *string `json:"title"`
		URL           *string `json:"url"`
		Type          *string `json:"type"`
		IsOfficial    *bool   `json:"is_official"`
		SequenceIndex *int    `json:"sequence_index"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	if input.Title != nil { resource.Title = *input.Title }
	if input.URL != nil { resource.URL = *input.URL }
	if input.Type != nil { resource.Type = *input.Type }
	if input.IsOfficial != nil { resource.IsOfficial = *input.IsOfficial }
	if input.SequenceIndex != nil { resource.SequenceIndex = *input.SequenceIndex }

	err = app.models.Resources.Update(resource)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}