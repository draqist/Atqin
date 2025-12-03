package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/google/uuid"
)

// GET /v1/roadmaps
func (app *application) listRoadmapsHandler(w http.ResponseWriter, r *http.Request) {
	// Default: Show only Public roadmaps (Safe default)
	includeDrafts := false

	// 1. Check if a user is logged in
	// The 'authenticateIfExists' middleware populates this context if a token is present
	if val := r.Context().Value(UserContextKey); val != nil {
		userID := val.(string)

		// 2. Check their role
		// We fetch the user to verify they are actually an admin
		user, err := app.models.Users.GetByID(userID)
		if err == nil && user.Role == "admin" {
			includeDrafts = true // Unlock Drafts
		}
		// If user lookup fails (e.g. deleted user), we just default to public view
	}

	// 3. Fetch Data based on permission
	roadmaps, err := app.models.Roadmaps.GetAll(includeDrafts)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch roadmaps")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmaps)
}

// GET /v1/roadmaps/{slug} (Handles both Slugs and UUIDs)
func (app *application) getRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	param := r.PathValue("id") // This grabs whatever is after /roadmaps/

	// Try to get UserID context (might be guest)
	userID := ""
	if val := r.Context().Value(UserContextKey); val != nil {
		userID = val.(string)
	}

	var roadmap *data.Roadmap
	var err error

	// SMART CHECK: Is this a UUID?
	if _, uuidErr := uuid.Parse(param); uuidErr == nil {
		// It IS a UUID -> Fetch by ID
		roadmap, err = app.models.Roadmaps.GetByID(param)
	} else {
		// It IS NOT a UUID -> Fetch by Slug
		roadmap, err = app.models.Roadmaps.GetBySlug(param, userID)
	}

	if err != nil {
		if err == data.ErrRecordNotFound {
			app.errorResponse(w, http.StatusNotFound, "Roadmap not found")
		} else {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch roadmap")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}

// POST /v1/roadmaps/{node_id}/progress (Protected)
// POST /v1/roadmaps/{node_id}/progress (Protected)
func (app *application) updateRoadmapProgressHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("node_id")
	userID := r.Context().Value(UserContextKey).(string) // Safe because protected route

	var input struct {
		Status string `json:"status"` // 'in_progress', 'completed'
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// RULE: To complete a book, you must have published a reflection
	if input.Status == "completed" {
		// 1. Get Book ID from Node ID
		bookID, err := app.models.Roadmaps.GetNodeBookID(nodeID)
		if err != nil {
			app.errorResponse(w, http.StatusNotFound, "Node not found")
			return
		}

		// 2. Check for published note
		hasNote, err := app.models.Notes.HasPublishedNote(userID, bookID)
		if err != nil {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to verify reflection")
			return
		}

		if !hasNote {
			app.errorResponse(w, http.StatusForbidden, "You must publish a reflection for this book before marking it as complete.")
			return
		}
	}

	err := app.models.Roadmaps.UpdateProgress(userID, nodeID, input.Status)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update progress")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "progress updated"}`))
}

func (app *application) createRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title         string `json:"title"`
		Slug          string `json:"slug"`
		Description   string `json:"description"`
		CoverImageURL string `json:"cover_image_url"`
		IsPublic      bool   `json:"is_public"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// Basic validation
	if input.Title == "" || input.Slug == "" {
		app.errorResponse(w, http.StatusBadRequest, "Title and Slug are required")
		return
	}

	roadmap := &data.Roadmap{
		Title:         input.Title,
		Slug:          input.Slug,
		Description:   input.Description,
		CoverImageURL: input.CoverImageURL,
		IsPublic:      input.IsPublic,
	}

	err := app.models.Roadmaps.Insert(roadmap)
	if err != nil {
		// Check for duplicate slug error (Postgres error code 23505)
		// For now, generic 500
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create roadmap")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}

// --- ROADMAP CONTAINER HANDLERS ---

func (app *application) updateRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	// 1. FETCH EXISTING ROADMAP
	// We need to know what's currently in the DB so we don't overwrite it with blanks
	roadmap, err := app.models.Roadmaps.GetByID(id)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "Roadmap not found")
		return
	}

	// 2. DEFINE INPUT WITH POINTERS
	// Pointers allow us to check if a field was actually provided in the JSON (nil check)
	var input struct {
		Title         *string `json:"title"`
		Slug          *string `json:"slug"`
		Description   *string `json:"description"`
		CoverImageURL *string `json:"cover_image_url"`
		IsPublic      *bool   `json:"is_public"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// 3. APPLY UPDATES (Only if field is not nil)
	if input.Title != nil {
		roadmap.Title = *input.Title
	}
	if input.Slug != nil {
		roadmap.Slug = *input.Slug
	}
	if input.Description != nil {
		roadmap.Description = *input.Description
	}
	if input.CoverImageURL != nil {
		roadmap.CoverImageURL = *input.CoverImageURL
	}
	if input.IsPublic != nil {
		roadmap.IsPublic = *input.IsPublic
	}

	// 4. SAVE TO DB
	err = app.models.Roadmaps.Update(roadmap)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update roadmap")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}

func (app *application) deleteRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := app.models.Roadmaps.Delete(id)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to delete roadmap")
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "roadmap deleted"}`))
}

// --- NODE HANDLERS (Adding Books to Track) ---

func (app *application) addRoadmapNodeHandler(w http.ResponseWriter, r *http.Request) {
	roadmapID := r.PathValue("id")

	var input struct {
		BookID        string `json:"book_id"`
		SequenceIndex int    `json:"sequence_index"`
		Level         string `json:"level"` // 'beginner', etc.
		Description   string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	node := &data.RoadmapNode{
		RoadmapID:     roadmapID,
		BookID:        input.BookID,
		SequenceIndex: input.SequenceIndex,
		Level:         input.Level,
		Description:   input.Description,
	}

	err := app.models.Roadmaps.InsertNode(node)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to add node")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(node)
}

func (app *application) updateRoadmapNodeHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("node_id")

	var input struct {
		BookID        string `json:"book_id"`
		SequenceIndex int    `json:"sequence_index"`
		Level         string `json:"level"`
		Description   string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	node := &data.RoadmapNode{
		ID:            nodeID,
		BookID:        input.BookID,
		SequenceIndex: input.SequenceIndex,
		Level:         input.Level,
		Description:   input.Description,
	}

	err := app.models.Roadmaps.UpdateNode(node)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update node")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(node)
}

func (app *application) deleteRoadmapNodeHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("node_id")
	err := app.models.Roadmaps.DeleteNode(nodeID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to delete node")
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "node deleted"}`))
}

func (app *application) batchUpdateRoadmapNodesHandler(w http.ResponseWriter, r *http.Request) {
	var input []struct {
		NodeID        string `json:"node_id"`
		SequenceIndex int    `json:"sequence_index"`
		Level         string `json:"level"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	err := app.models.Roadmaps.BatchUpdateNodes(input)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update order")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "order updated"}`))
}
