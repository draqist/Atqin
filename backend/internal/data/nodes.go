package data

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// ContentNode represents a single unit of text (Chapter, Section, or Bayt) within a book.
type ContentNode struct {
	ID            string  `json:"id"`
	BookID        string  `json:"book_id"`
	ParentID      *string `json:"parent_id"`
	NodeType      string  `json:"node_type"`
	ContentText   string  `json:"content_text"`
	SequenceIndex int     `json:"sequence_index"`
	Version       int     `json:"version"`
}

// NodeModel wraps the database connection pool for ContentNode-related operations.
type NodeModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

// Insert adds a new content node to the database.
// It returns the ID and initial version of the newly created node.
func (m NodeModel) Insert(node *ContentNode) error {
	query := `
		INSERT INTO content_nodes (book_id, parent_id, node_type, content_text, sequence_index)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, version`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var parentID sql.NullString
	if node.ParentID != nil {
		parentID.String = *node.ParentID
		parentID.Valid = true
	}

	err := m.DB.QueryRowContext(ctx, query,
		node.BookID,
		parentID,
		node.NodeType,
		node.ContentText,
		node.SequenceIndex,
	).Scan(&node.ID, &node.Version)

	if err != nil {
		return err
	}

	// Invalidate nodes list for this book
	return m.Cache.Delete(context.Background(), fmt.Sprintf("nodes:book:%s", node.BookID))
}

// GetByBookID retrieves the entire content tree for a specific book.
// It returns a slice of ContentNode pointers ordered by sequence index.
func (m NodeModel) GetByBookID(bookID string) ([]*ContentNode, error) {
	// 1. Try Cache
	var nodes []*ContentNode
	cacheKey := fmt.Sprintf("nodes:book:%s", bookID)
	if m.Cache.Get(context.Background(), cacheKey, &nodes) {
		return nodes, nil
	}

	query := `
		SELECT id, book_id, parent_id, node_type, content_text, sequence_index, version
		FROM content_nodes
		WHERE book_id = $1
		ORDER BY sequence_index ASC`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var node ContentNode
		var parentID sql.NullString

		err := rows.Scan(
			&node.ID,
			&node.BookID,
			&parentID,
			&node.NodeType,
			&node.ContentText,
			&node.SequenceIndex,
			&node.Version,
		)
		if err != nil {
			return nil, err
		}

		if parentID.Valid {
			node.ParentID = &parentID.String
		}
		nodes = append(nodes, &node)
	}

	// 2. Set Cache (1 Hour)
	m.Cache.Set(context.Background(), cacheKey, nodes, 1*time.Hour)

	return nodes, nil
}