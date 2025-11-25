package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// createResourceHandler
func (app *application) createResourceHandler(w http.ResponseWriter, r *http.Request) {
	// Define a struct that can hold children
	type ResourceInput struct {
		BookID        string           `json:"book_id"`
		Type          string           `json:"type"`
		Title         string           `json:"title"`
		URL           string           `json:"url"`
		IsOfficial    bool             `json:"is_official"`
		ParentID      *string          `json:"parent_id"`
		SequenceIndex int              `json:"sequence_index"`
		// NEW: Children for playlists
		Children      []*ResourceInput `json:"children"` 
	}

	var input ResourceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// 1. START TRANSACTION
	tx, err := app.models.Resources.DB.Begin()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	// Defer rollback in case of panic/error
	defer tx.Rollback() 

	// 2. Helper to insert a single resource within the transaction
	insertFunc := func(res *data.Resource) error {
		query := `
			INSERT INTO resources (book_id, type, title, url, is_official, parent_id, sequence_index)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, created_at`
		return tx.QueryRow(query, res.BookID, res.Type, res.Title, res.URL, res.IsOfficial, res.ParentID, res.SequenceIndex).Scan(&res.ID, &res.CreatedAt)
	}

	// 3. Create the Parent (Playlist)
	parent := &data.Resource{
		BookID: input.BookID,
		Type:   input.Type,
		Title:  input.Title,
		URL:    input.URL,
		IsOfficial: input.IsOfficial,
		ParentID:   input.ParentID,
		SequenceIndex: input.SequenceIndex,
	}

	if err := insertFunc(parent); err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create parent resource")
		return
	}

	// 4. Create Children (if Playlist)
	if input.Type == "playlist" && len(input.Children) > 0 {
		for i, childInput := range input.Children {
			child := &data.Resource{
				BookID:        input.BookID, // Inherit Book ID
				Type:          "youtube_video", // Force type or use childInput.Type
				Title:         childInput.Title,
				URL:           childInput.URL,
				IsOfficial:    input.IsOfficial, // Inherit Official status
				ParentID:      &parent.ID,       // LINK TO PARENT
				SequenceIndex: i + 1,            // Auto-increment order
			}
			
			if err := insertFunc(child); err != nil {
				app.logger.Println(err)
				app.errorResponse(w, http.StatusInternalServerError, "Failed to create child resource")
				return
			}
		}
	}

	// 5. COMMIT TRANSACTION
	if err := tx.Commit(); err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parent)
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
func (app *application) getResourceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	resource, err := app.models.Resources.Get(id)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "Resource not found")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}