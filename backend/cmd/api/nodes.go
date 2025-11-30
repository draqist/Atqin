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

func (app *application) batchCreateNodesHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")
	
	var input struct {
		Lines []struct {
			Type          string `json:"type"`
			ContentText   string `json:"content_text"`
			SequenceIndex int    `json:"sequence_index"`
		} `json:"lines"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// Transaction to ensure all or nothing
	tx, _ := app.db.Begin()
	defer tx.Rollback()

	// 1. Clear existing nodes (Optional: depends if you want to append or replace)
	// tx.Exec("DELETE FROM content_nodes WHERE book_id = $1", bookID)

	// 2. Insert new nodes
	stmt, _ := tx.Prepare(`INSERT INTO content_nodes (book_id, node_type, content_text, sequence_index) VALUES ($1, $2, $3, $4)`)
	defer stmt.Close()

	for _, line := range input.Lines {
		_, err := stmt.Exec(bookID, line.Type, line.ContentText, line.SequenceIndex)
		if err != nil {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to insert node")
			return
		}
	}

	tx.Commit()
	w.WriteHeader(http.StatusCreated)
}