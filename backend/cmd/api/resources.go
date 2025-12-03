package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/youtube"
)

// createResourceHandler adds a new resource to the database.
// It supports creating single resources or playlists with child resources.
// POST /v1/resources
func (app *application) createResourceHandler(w http.ResponseWriter, r *http.Request) {
	type ResourceInput struct {
		BookID        string           `json:"book_id"`
		Type          string           `json:"type"`
		Title         string           `json:"title"`
		URL           string           `json:"url"`
		IsOfficial    bool             `json:"is_official"`
		ParentID      *string          `json:"parent_id"`
		SequenceIndex int              `json:"sequence_index"`
		Children      []*ResourceInput `json:"children"`
	}

	var input ResourceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	tx, err := app.models.Resources.DB.Begin()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	insertFunc := func(res *data.Resource) error {
		query := `
			INSERT INTO resources (book_id, type, title, url, is_official, parent_id, sequence_index)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, created_at`
		return tx.QueryRow(query, res.BookID, res.Type, res.Title, res.URL, res.IsOfficial, res.ParentID, res.SequenceIndex).Scan(&res.ID, &res.CreatedAt)
	}

	parent := &data.Resource{
		BookID:        input.BookID,
		Type:          input.Type,
		Title:         input.Title,
		URL:           input.URL,
		IsOfficial:    input.IsOfficial,
		ParentID:      input.ParentID,
		SequenceIndex: input.SequenceIndex,
	}

	if err := insertFunc(parent); err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create parent resource")
		return
	}

	if input.Type == "playlist" && len(input.Children) > 0 {
		for i, childInput := range input.Children {
			child := &data.Resource{
				BookID:        input.BookID,
				Type:          "youtube_video",
				Title:         childInput.Title,
				URL:           childInput.URL,
				IsOfficial:    input.IsOfficial,
				ParentID:      &parent.ID,
				SequenceIndex: i + 1,
			}

			if err := insertFunc(child); err != nil {
				app.logger.Println(err)
				app.errorResponse(w, http.StatusInternalServerError, "Failed to create child resource")
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parent)
}

// listAllResourcesHandler retrieves all resources for the admin dashboard.
// GET /v1/resources
func (app *application) listAllResourcesHandler(w http.ResponseWriter, r *http.Request) {
	resources, err := app.models.Resources.GetAll()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch resources")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}

// deleteResourceHandler removes a resource from the database.
// DELETE /v1/resources/{id}
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

// updateResourceHandler modifies an existing resource.
// PUT /v1/resources/{id}
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

	if input.Title != nil {
		resource.Title = *input.Title
	}
	if input.URL != nil {
		resource.URL = *input.URL
	}
	if input.Type != nil {
		resource.Type = *input.Type
	}
	if input.IsOfficial != nil {
		resource.IsOfficial = *input.IsOfficial
	}
	if input.SequenceIndex != nil {
		resource.SequenceIndex = *input.SequenceIndex
	}

	err = app.models.Resources.Update(resource)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource)
}

// getResourceHandler retrieves a single resource by its ID.
// GET /v1/resources/{id}
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

// listBookResourcesHandler retrieves all resources associated with a specific book.
// GET /v1/books/{id}/resources
func (app *application) listBookResourcesHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")

	resources, err := app.models.Resources.GetByBookID(bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resources)
}

// fetchYouTubePlaylistHandler fetches videos from a YouTube playlist and returns them as potential resources.
// POST /v1/tools/youtube-playlist
func (app *application) fetchYouTubePlaylistHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		PlaylistID string `json:"playlist_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	videos, err := youtube.FetchPlaylistVideos(input.PlaylistID)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch from YouTube")
		return
	}

	type ChildInput struct {
		Title string `json:"title"`
		URL   string `json:"url"`
	}
	var children []ChildInput

	for _, v := range videos {
		children = append(children, ChildInput{
			Title: v.Snippet.Title,
			URL:   "https://www.youtube.com/watch?v=" + v.Snippet.ResourceId.VideoId,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(children)
}

// searchYouTubePlaylistsHandler searches for YouTube playlists matching a query.
// GET /v1/tools/youtube-search
func (app *application) searchYouTubePlaylistsHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		app.errorResponse(w, http.StatusBadRequest, "Search query required")
		return
	}

	apiKey := os.Getenv("YOUTUBE_API_KEY")
	url := fmt.Sprintf(
		"https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=%s&maxResults=10&key=%s",
		url.QueryEscape(query), apiKey,
	)

	resp, err := http.Get(url)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to contact YouTube")
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}