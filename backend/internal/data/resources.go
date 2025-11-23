package data

import (
	"context"
	"database/sql"
	"time"
)

type Resource struct {
	ID                string    `json:"id"`
	BookID            string    `json:"book_id"`
	Type              string    `json:"type"`
	Title             string    `json:"title"`
	URL               string    `json:"url"`
	MediaStartSeconds int       `json:"media_start_seconds"`
	MediaEndSeconds   int       `json:"media_end_seconds"`
	IsOfficial        bool      `json:"is_official"`
	ParentID          *string   `json:"parent_id"`
	SequenceIndex     int       `json:"sequence_index"`
	CreatedAt         time.Time `json:"created_at"`
}

type ResourceModel struct {
	DB *sql.DB
}

func (m ResourceModel) GetByBookID(bookID string) ([]*Resource, error) {
	// We keep the ::text cast for UUIDs to be safe
	query := `
		SELECT 
			id::text, 
			book_id::text, 
			type, 
			title, 
			url, 
			media_start_seconds, 
			media_end_seconds, 
			is_official, 
			parent_id::text, 
			sequence_index, 
			created_at
		FROM resources
		WHERE book_id = $1
		ORDER BY is_official DESC, sequence_index ASC, created_at DESC`

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
		
		// HELPERS FOR NULLABLE COLUMNS
		var parentID sql.NullString 
		var mediaStart sql.NullInt32 // Fix for potential nulls
		var mediaEnd sql.NullInt32   // Fix for the error you saw

		err := rows.Scan(
			&r.ID,
			&r.BookID,
			&r.Type,
			&r.Title,
			&r.URL,
			&mediaStart,      // Scan into NullInt32
			&mediaEnd,        // Scan into NullInt32
			&r.IsOfficial,
			&parentID,        // Scan into NullString
			&r.SequenceIndex,
			&r.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		// ASSIGN VALUES IF VALID
		if parentID.Valid {
			r.ParentID = &parentID.String
		}
		if mediaStart.Valid {
			r.MediaStartSeconds = int(mediaStart.Int32)
		}
		if mediaEnd.Valid {
			r.MediaEndSeconds = int(mediaEnd.Int32)
		}

		resources = append(resources, &r)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return resources, nil
}