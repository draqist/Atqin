package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/validator"
	"github.com/draqist/iqraa/backend/internal/youtube"
	"github.com/google/uuid"
)

// createResourceHandler adds a new resource to the database.
// It supports creating single resources or playlists with child resources.
// POST /v1/resources
func (app *application) createResourceHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Identify User & Determine Status/Permissions
	userID := r.Context().Value(UserContextKey).(string)
	user, err := app.models.Users.GetByID(userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// Workflow Logic: Super Admin = Published, Regular Admin = Pending
	status := "pending_review"
	isOfficial := true // Staff uploads are official by default
	if user.Role == "super_admin" {
		status = "published"
	}

	// 2. Branch Logic based on Content-Type
	contentType := r.Header.Get("Content-Type")

	if strings.HasPrefix(contentType, "multipart/form-data") {
		// --- BRANCH A: FILE UPLOAD (R2) ---
		app.handleFileResource(w, r, userID, status, isOfficial)
	} else {
		// --- BRANCH B: JSON LINK/PLAYLIST ---
		app.handleJSONResource(w, r, userID, status, isOfficial)
	}
}

// Helper: Handles PDF/Audio uploads to R2
func (app *application) handleFileResource(w http.ResponseWriter, r *http.Request, userID, status string, isOfficial bool) {
	// Limit upload size (e.g., 50MB)
	err := r.ParseMultipartForm(50 << 20)
	if err != nil {
		app.badRequestResponse(w, r, fmt.Errorf("file too large or invalid form"))
		return
	}

	// Extract Metadata
	title := r.FormValue("title")
	bookID := r.FormValue("book_id")
	resType := r.FormValue("type") // 'pdf' or 'audio'

	if title == "" || bookID == "" {
		app.badRequestResponse(w, r, fmt.Errorf("title and book_id are required"))
		return
	}

	// Get File
	file, header, err := r.FormFile("file")
	if err != nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing file"))
		return
	}
	defer file.Close()

	// Upload to R2
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		ext = ".pdf" // default fallback
	}
	// Generate random key: uuid + extension
	objectKey := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	mimeType := header.Header.Get("Content-Type")

	publicURL, err := app.storage.UploadFile(objectKey, file, mimeType)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// Insert into DB
	resource := &data.Resource{
		BookID:     bookID,
		Type:       resType,
		Title:      title,
		URL:        publicURL,
		IsOfficial: isOfficial,
		Status:     status,
		CreatedBy:  &userID,
	}

	if err := app.models.Resources.Insert(resource); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, envelope{"resource": resource}, nil)
}

// Helper: Handles YouTube Links/Playlists (Your original logic, updated)
func (app *application) handleJSONResource(w http.ResponseWriter, r *http.Request, userID, status string, isOfficial bool) {
	type ResourceInput struct {
		BookID        string           `json:"book_id"`
		Type          string           `json:"type"`
		Title         string           `json:"title"`
		URL           string           `json:"url"`
		ParentID      *string          `json:"parent_id"`
		SequenceIndex int              `json:"sequence_index"`
		Children      []*ResourceInput `json:"children"`
	}

	var input ResourceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.badRequestResponse(w, r, fmt.Errorf("invalid json: %v", err))
		return
	}

	tx, err := app.models.Resources.DB.Begin()
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	defer tx.Rollback()

	// Helper to insert within transaction
	// Note: We added 'status' and 'created_by' columns
	insertFunc := func(res *data.Resource) error {
		query := `
			INSERT INTO resources (book_id, type, title, url, is_official, parent_id, sequence_index, status, created_by)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id, created_at`
		
		return tx.QueryRow(
			query, 
			res.BookID, res.Type, res.Title, res.URL, res.IsOfficial, res.ParentID, res.SequenceIndex, 
			status, userID, // <-- New Fields
		).Scan(&res.ID, &res.CreatedAt)
	}

	// 1. Create Parent
	parent := &data.Resource{
		BookID:        input.BookID,
		Type:          input.Type,
		Title:         input.Title,
		URL:           input.URL,
		IsOfficial:    isOfficial,
		ParentID:      input.ParentID,
		SequenceIndex: input.SequenceIndex,
	}

	if err := insertFunc(parent); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// 2. Create Children (if Playlist)
	if input.Type == "playlist" && len(input.Children) > 0 {
		for i, childInput := range input.Children {
			child := &data.Resource{
				BookID:        input.BookID,
				Type:          "youtube_video",
				Title:         childInput.Title,
				URL:           childInput.URL,
				IsOfficial:    isOfficial,
				ParentID:      &parent.ID,
				SequenceIndex: i + 1,
			}

			if err := insertFunc(child); err != nil {
				app.serverErrorResponse(w, r, err)
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// Attach status for response
	parent.Status = status
	app.writeJSON(w, http.StatusCreated, envelope{"resource": parent}, nil)
}

// listAllResourcesHandler retrieves all resources for the admin dashboard.
// GET /v1/resources
func (app *application) listAllResourcesHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		data.Filters
	}

	v := validator.New()
	qs := r.URL.Query()

	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 20, v)
	input.Filters.Sort = app.readString(qs, "sort", "id")
	input.Filters.SortSafeList = []string{"id", "created_at"}
    title := app.readString(qs, "q", "")
    status := app.readString(qs, "status", "")

	if data.ValidateFilters(v, input.Filters); !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

    // Admin dashboard usually has authorized user.
    // We'll trust the caller to pass status, but could enforce role defaults if we wanted strict view control.
    // For now, allow filtering.
    
	resources, metadata, err := app.models.Resources.GetAll(title, input.Filters, status)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch resources")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	// We should probably return metadata too, but for now let's just return resources to match previous behavior if frontend expects array
	// Actually, admin dashboard usually expects metadata for pagination.
	// Let's wrap it in an envelope or just return resources if that's what it expects, but the request was for pagination.
	// Assuming standard envelope response for paginated data:
	app.writeJSON(w, http.StatusOK, envelope{"resources": resources, "metadata": metadata}, nil)
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
        Status        *string `json:"status"`
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
    
    if input.Status != nil {
        userID, ok := r.Context().Value(UserContextKey).(string)
        if ok && userID != "" {
            u, err := app.models.Users.GetByID(userID)
            if err == nil {
                switch u.Role {
                case "super_admin":
                    resource.Status = *input.Status
                case "admin":
                     if *input.Status == "published" {
                         app.errorResponse(w, http.StatusForbidden, "Admins cannot publish resources")
                         return
                     }
                     resource.Status = *input.Status
                }
            }
        }
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