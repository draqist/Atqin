package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/google/uuid"
)

// listRoadmapsHandler retrieves all roadmaps.
// Admins can see draft roadmaps; regular users only see public ones.
// GET /v1/roadmaps
func (app *application) listRoadmapsHandler(w http.ResponseWriter, r *http.Request) {
	includeDrafts := false

	if val := r.Context().Value(UserContextKey); val != nil {
		userID := val.(string)

		user, err := app.models.Users.GetByID(userID)
		if err == nil && user.Role == "admin" {
			includeDrafts = true
		}
	}

	roadmaps, err := app.models.Roadmaps.GetAll(includeDrafts)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch roadmaps")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmaps)
}

// getRoadmapHandler retrieves a specific roadmap by its ID or slug.
// GET /v1/roadmaps/{id}
func (app *application) getRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	param := r.PathValue("id")

	userID := ""
	if val := r.Context().Value(UserContextKey); val != nil {
		userID = val.(string)
	}

	var roadmap *data.Roadmap
	var err error

	if _, uuidErr := uuid.Parse(param); uuidErr == nil {
		roadmap, err = app.models.Roadmaps.GetByID(param)
	} else {
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

// updateRoadmapProgressHandler updates the user's progress on a specific roadmap node.
// It enforces that a reflection must be published before marking a book as completed.
// POST /v1/roadmaps/nodes/{node_id}/progress
func (app *application) updateRoadmapProgressHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("node_id")
	userID := r.Context().Value(UserContextKey).(string)

	var input struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	if input.Status == "completed" {
		bookID, err := app.models.Roadmaps.GetNodeBookID(nodeID)
		if err != nil {
			app.errorResponse(w, http.StatusNotFound, "Node not found")
			return
		}

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

// createRoadmapHandler creates a new roadmap.
// POST /v1/roadmaps
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
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create roadmap")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}

// updateRoadmapHandler updates an existing roadmap.
// PUT /v1/roadmaps/{id}
func (app *application) updateRoadmapHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	roadmap, err := app.models.Roadmaps.GetByID(id)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "Roadmap not found")
		return
	}

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

	err = app.models.Roadmaps.Update(roadmap)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update roadmap")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roadmap)
}

// deleteRoadmapHandler deletes a roadmap.
// DELETE /v1/roadmaps/{id}
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

// addRoadmapNodeHandler adds a book node to a roadmap.
// POST /v1/roadmaps/{id}/nodes
func (app *application) addRoadmapNodeHandler(w http.ResponseWriter, r *http.Request) {
	roadmapID := r.PathValue("id")

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

// updateRoadmapNodeHandler updates a roadmap node.
// PUT /v1/roadmaps/nodes/{node_id}
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

// deleteRoadmapNodeHandler deletes a roadmap node.
// DELETE /v1/roadmaps/nodes/{node_id}
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

// batchUpdateRoadmapNodesHandler updates the order/level of multiple roadmap nodes.
// PUT /v1/roadmaps/{id}/nodes/reorder
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
