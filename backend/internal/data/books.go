package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"
)

// Book struct matches your SQL table
type Book struct {
	ID             string          `json:"id"` // UUID string
	Title          string          `json:"title"`
	OriginalAuthor string          `json:"original_author"`
	Description    string          `json:"description"`
	CoverImageURL  string          `json:"cover_image_url"`
	Metadata       json.RawMessage `json:"metadata"` // specialized type for JSONB
	IsPublic       bool            `json:"is_public"`
	CreatedAt      time.Time       `json:"created_at"`
	Version        int             `json:"version"`
}

// BookModel wraps the connection pool
type BookModel struct {
	DB *sql.DB
}

// Insert adds a new book to the database
func (m BookModel) Insert(book *Book) error {
	query := `
		INSERT INTO books (title, original_author, description, cover_image_url, metadata, is_public)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, version`

	// Create a context with a 3-second timeout
	// If the DB takes longer than 3s, we cancel the request to save resources
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []any{book.Title, book.OriginalAuthor, book.Description, book.CoverImageURL, book.Metadata, book.IsPublic}

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&book.ID, &book.CreatedAt, &book.Version)
}

// Get retrieves a specific book by ID
func (m BookModel) Get(id string) (*Book, error) {
	if id == "" {
		return nil, errors.New("invalid id")
	}

	query := `
		SELECT id, title, original_author, description, cover_image_url, metadata, is_public, created_at, version
		FROM books
		WHERE id = $1`

	var book Book

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&book.ID,
		&book.Title,
		&book.OriginalAuthor,
		&book.Description,
		&book.CoverImageURL,
		&book.Metadata,
		&book.IsPublic,
		&book.CreatedAt,
		&book.Version,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("record not found")
		}
		return nil, err
	}

	return &book, nil
}

// GetAll returns a list of all books (for the main library page)
func (m BookModel) GetAll() ([]*Book, error) {
	// The SQL query: Select everything, order by ID
	query := `
		SELECT id, title, original_author, description, cover_image_url, metadata, is_public, created_at, version
		FROM books
		ORDER BY id`

	// Timeout context (3 seconds max)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close() // Important: Close the connection when done

	// Loop through the rows (like iterating through an array)
	var books []*Book
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.OriginalAuthor,
			&book.Description,
			&book.CoverImageURL,
			&book.Metadata,
			&book.IsPublic,
			&book.CreatedAt,
			&book.Version,
		)
		if err != nil {
			return nil, err
		}
		books = append(books, &book)
	}

	// Check if there were errors during iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return books, nil
}

func (m BookModel) Update(book *Book) error {
	query := `
		UPDATE books
		SET title = $1, original_author = $2, description = $3, cover_image_url = $4, metadata = $5, is_public = $6, version = version + 1
		WHERE id = $7
		RETURNING version`

	args := []any{
		book.Title,
		book.OriginalAuthor,
		book.Description,
		book.CoverImageURL,
		book.Metadata,
		book.IsPublic,
		book.ID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&book.Version)
}

func (m BookModel) Delete(id string) error {
	// Verify it exists first (optional, but good practice)
	if id == "" {
		return errors.New("invalid id")
	}

	query := `DELETE FROM books WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrRecordNotFound
	}

	return nil
}