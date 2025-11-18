package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// createNodeHandler allows adding a Chapter or Verse to a book
func (app *application) createNodeHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Get the Book ID from the URL path (Go 1.22+ feature)
	bookID := r.PathValue("id")
	if bookID == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	// 2. Parse Input
	var input struct {
		ParentID      *string `json:"parent_id"` // Optional (nil if it's a top-level Chapter)
		NodeType      string  `json:"node_type"` // 'chapter' or 'bayt'
		ContentText   string  `json:"content_text"`
		SequenceIndex int     `json:"sequence_index"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// 3. Create Node
	node := &data.ContentNode{
		BookID:        bookID,
		ParentID:      input.ParentID,
		NodeType:      input.NodeType,
		ContentText:   input.ContentText,
		SequenceIndex: input.SequenceIndex,
	}

	// 4. Save to DB
	err := app.models.Nodes.Insert(node)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 5. Respond
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(node)
}

// listBookNodesHandler handles GET /v1/books/{id}/nodes
// This returns the "Tree" of the book
func (app *application) listBookNodesHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")

	// We already wrote GetByBookID in internal/data/nodes.go previously
	nodes, err := app.models.Nodes.GetByBookID(bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}