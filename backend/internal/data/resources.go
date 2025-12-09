package data

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

// Resource represents an external or internal resource linked to a book.
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
	BookTitle         string    `json:"book_title,omitempty"`
	Status            string    `json:"status"`
	ReviewerID        *string   `json:"reviewer_id"`
}

// ResourceModel wraps the database connection pool for Resource-related operations.
type ResourceModel struct {
	DB *sql.DB
}

// GetByBookID retrieves all resources associated with a specific book.
// It orders them by official status, sequence index, and creation time.
func (m ResourceModel) GetByBookID(bookID string) ([]*Resource, error) {
	query := `
        SELECT id, book_id, type, title, url, media_start_seconds, media_end_seconds, is_official, created_at, parent_id, sequence_index, status, reviewer_id
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

		var parentID sql.NullString
		var mediaStart, mediaEnd sql.NullInt32

		err := rows.Scan(
			&r.ID,
			&r.BookID,
			&r.Type,
			&r.Title,
			&r.URL,
			&mediaStart,
			&mediaEnd,
			&r.IsOfficial,
			&r.CreatedAt,
			&parentID,
			&r.SequenceIndex,
			&r.Status,
			&r.ReviewerID,
		)
		if err != nil {
			return nil, err
		}

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

// Get retrieves a single resource by its ID.
func (m ResourceModel) Get(id string) (*Resource, error) {
	query := `
		SELECT id::text, book_id::text, type, title, url, media_start_seconds, media_end_seconds, is_official, parent_id::text, sequence_index, created_at, status, reviewer_id::text
		FROM resources
		WHERE id = $1`

	var r Resource
	var parentID sql.NullString
	var mediaStart, mediaEnd sql.NullInt32

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var reviewerID sql.NullString
	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&r.ID, &r.BookID, &r.Type, &r.Title, &r.URL,
		&mediaStart, &mediaEnd, &r.IsOfficial, &parentID, &r.SequenceIndex, &r.CreatedAt, &r.Status, &reviewerID,
	)

	if reviewerID.Valid {
		r.ReviewerID = &reviewerID.String
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	if parentID.Valid {
		r.ParentID = &parentID.String
	}
	if mediaStart.Valid {
		r.MediaStartSeconds = int(mediaStart.Int32)
	}
	if mediaEnd.Valid {
		r.MediaEndSeconds = int(mediaEnd.Int32)
	}

	return &r, nil
}

// GetAll fetches all resources, joined with book titles.
// This is primarily used for the Admin dashboard.
func (m ResourceModel) GetAll(title string, filters Filters, status string) ([]*Resource, Metadata, error) {
	query := `
        SELECT count(*) OVER(),
            r.id::text, 
            r.book_id::text, 
            b.title as book_title, -- Get the human readable title
            r.type, 
            r.title, 
            r.url, 
            r.is_official, 
            r.created_at,
            r.status,
            r.reviewer_id::text
        FROM resources r
        JOIN books b ON r.book_id = b.id
        WHERE (r.title ILIKE '%' || $3 || '%' OR $3 = '')
        AND ($4 = '' OR r.status::text = $4)
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, filters.Limit(), filters.Offset(), title, status)
	if err != nil {
		return nil, Metadata{}, err
	}
	defer rows.Close()

	totalRecords := 0
	var resources []*Resource
	for rows.Next() {
		var r Resource
		var reviewerID sql.NullString
		err := rows.Scan(&totalRecords, &r.ID, &r.BookID, &r.BookTitle, &r.Type, &r.Title, &r.URL, &r.IsOfficial, &r.CreatedAt, &r.Status, &reviewerID)
		if err != nil {
			return nil, Metadata{}, err
		}
		if reviewerID.Valid {
			r.ReviewerID = &reviewerID.String
		}
		resources = append(resources, &r)
	}

	if err = rows.Err(); err != nil {
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return resources, metadata, nil
}

// Insert adds a new resource to the database.
func (m ResourceModel) Insert(r *Resource) error {
	query := `
		INSERT INTO resources (book_id, type, title, url, media_start_seconds, media_end_seconds, is_official, parent_id, sequence_index, status, reviewer_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at`

	args := []any{
		r.BookID, r.Type, r.Title, r.URL,
		r.MediaStartSeconds, r.MediaEndSeconds, r.IsOfficial,
		r.ParentID, r.SequenceIndex, r.Status, r.ReviewerID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&r.ID, &r.CreatedAt)
}

// Update modifies an existing resource.
func (m ResourceModel) Update(r *Resource) error {
	query := `
		UPDATE resources
		SET title = $1, url = $2, type = $3, is_official = $4, sequence_index = $5, parent_id = $6, status = $7, reviewer_id = $8
		WHERE id = $9`

	args := []any{r.Title, r.URL, r.Type, r.IsOfficial, r.SequenceIndex, r.ParentID, r.Status, r.ReviewerID, r.ID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, args...)
	return err
}

// Delete removes a resource from the database.
func (m ResourceModel) Delete(id string) error {
	query := `DELETE FROM resources WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrRecordNotFound
	}
	return nil
}
