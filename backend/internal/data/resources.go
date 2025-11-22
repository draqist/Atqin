package data

import (
	"context"
	"database/sql"
	"time"
)

type Resource struct {
	ID                string    `json:"id"`
	BookID            string    `json:"book_id"`
	Type              string    `json:"type"` // 'youtube_video', 'pdf', etc.
	Title             string    `json:"title"`
	URL               string    `json:"url"`
	MediaStartSeconds int       `json:"media_start_seconds"`
	MediaEndSeconds   int       `json:"media_end_seconds"`
	IsOfficial        bool      `json:"is_official"`
	CreatedAt         time.Time `json:"created_at"`
}

type ResourceModel struct {
	DB *sql.DB
}

// GetByBookID fetches all resources linked to a specific book
func (m ResourceModel) GetByBookID(bookID string) ([]*Resource, error) {
	query := `
		SELECT id, book_id, type, title, url, media_start_seconds, media_end_seconds, is_official, created_at
		FROM resources
		WHERE book_id = $1
		ORDER BY is_official DESC, created_at DESC` // Official stuff first

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resources []*Resource
	for rows.Next() {
		var r Resource
		// We scan into the struct. Note: standard sql doesn't handle NULL ints well usually, 
		// but since we defined DEFAULT 0 in schema, it's safe.
		// If you allowed NULLs in schema without defaults, we'd need sql.NullInt32
		err := rows.Scan(
			&r.ID,
			&r.BookID,
			&r.Type,
			&r.Title,
			&r.URL,
			&r.MediaStartSeconds,
			&r.MediaEndSeconds,
			&r.IsOfficial,
			&r.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		resources = append(resources, &r)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return resources, nil
}