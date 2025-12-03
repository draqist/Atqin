package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// createNodeHandler adds a new content node (Chapter or Verse) to a book.
// POST /v1/books/{id}/nodes
func (app *application) createNodeHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")
	if bookID == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	var input struct {
		ParentID      *string `json:"parent_id"`
		NodeType      string  `json:"node_type"`
		ContentText   string  `json:"content_text"`
		SequenceIndex int     `json:"sequence_index"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	node := &data.ContentNode{
		BookID:        bookID,
		ParentID:      input.ParentID,
		NodeType:      input.NodeType,
		ContentText:   input.ContentText,
		SequenceIndex: input.SequenceIndex,
	}

	err := app.models.Nodes.Insert(node)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(node)
}

// listBookNodesHandler retrieves the entire content tree for a specific book.
// GET /v1/books/{id}/nodes
func (app *application) listBookNodesHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")

	nodes, err := app.models.Nodes.GetByBookID(bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

// batchCreateNodesHandler allows creating multiple content nodes in a single transaction.
// POST /v1/books/{id}/nodes/batch
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

	tx, _ := app.db.Begin()
	defer tx.Rollback()

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