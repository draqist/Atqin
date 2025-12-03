package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"
)

// Book represents a book or text in the library.
type Book struct {
	ID             string          `json:"id"`
	Title          string          `json:"title"`
	OriginalAuthor string          `json:"original_author"`
	Description    string          `json:"description"`
	CoverImageURL  string          `json:"cover_image_url"`
	Metadata       json.RawMessage `json:"metadata"`
	IsPublic       bool            `json:"is_public"`
	CreatedAt      time.Time       `json:"created_at"`
	Version        int             `json:"version"`
	TitleAr        *string         `json:"title_ar"`
	OriginalAuthorAr *string       `json:"author_ar"`
	ResourceCount  int             `json:"resource_count"`
}

// BookModel wraps the database connection pool for Book-related operations.
type BookModel struct {
	DB *sql.DB
}

// Insert adds a new book to the database.
// It returns the ID, creation time, and initial version of the newly created book.
func (m BookModel) Insert(book *Book) error {
	query := `
		INSERT INTO books (title, original_author, description, cover_image_url, metadata, is_public)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, version`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []any{book.Title, book.OriginalAuthor, book.Description, book.CoverImageURL, book.Metadata, book.IsPublic}

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&book.ID, &book.CreatedAt, &book.Version)
}

// Get retrieves a specific book by its ID.
// It returns the Book struct or an error if not found.
func (m BookModel) Get(id string) (*Book, error) {
	if id == "" {
		return nil, errors.New("invalid id")
	}

	query := `
		SELECT id, title, original_author, COALESCE(description, ''), COALESCE(cover_image_url, ''), COALESCE(metadata, '{}'), is_public, created_at, version
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

// GetAll returns a paginated list of books filtered by title or author.
// It returns a slice of Book pointers, metadata for pagination, or an error.
func (m BookModel) GetAll(title string, filters Filters) ([]*Book, Metadata, error) {
	query := `
		SELECT count(*) OVER(), id, title, original_author, COALESCE(description, ''), COALESCE(cover_image_url, ''), COALESCE(metadata, '{}'), is_public, created_at, version,
		(SELECT COUNT(*) FROM resources WHERE book_id = books.id) as resource_count
		FROM books
		WHERE (title ILIKE '%' || $1 || '%' OR $1 = '')
		OR (original_author ILIKE '%' || $1 || '%' OR $1 = '')
		ORDER BY id`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, title)
	if err != nil {
		return nil, Metadata{}, err
	}
	defer rows.Close()

	totalRecords := 0
	books := []*Book{}
	for rows.Next() {
		var book Book
		err := rows.Scan(
			&totalRecords,
			&book.ID,
			&book.Title,
			&book.OriginalAuthor,
			&book.Description,
			&book.CoverImageURL,
			&book.Metadata,
			&book.IsPublic,
			&book.CreatedAt,
			&book.Version,
			&book.ResourceCount,
		)
		if err != nil {
			return nil, Metadata{}, err
		}
		books = append(books, &book)
	}

	if err = rows.Err(); err != nil {
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return books, metadata, nil
}

// Update modifies an existing book's details in the database.
// It increments the version number for optimistic locking.
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

// Delete removes a book from the database by its ID.
// It returns ErrRecordNotFound if the book does not exist.
func (m BookModel) Delete(id string) error {
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

// UpdateProgress records the user's reading progress for a specific book.
// It updates the current page and total pages, or inserts a new record if none exists.
func (m BookModel) UpdateProgress(userID, bookID string, currentPage, totalPages int) error {
	query := `
		INSERT INTO user_book_progress (user_id, book_id, current_page, total_pages, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id, book_id)
		DO UPDATE SET 
			current_page = EXCLUDED.current_page,
			total_pages = EXCLUDED.total_pages,
			updated_at = NOW()`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, bookID, currentPage, totalPages)
	return err
}

// GetProgress retrieves the user's reading progress for a specific book.
// It returns the current page and total pages. If no progress exists, it defaults to page 1.
func (m BookModel) GetProgress(userID, bookID string) (int, int, error) {
	query := `
		SELECT current_page, total_pages
		FROM user_book_progress
		WHERE user_id = $1 AND book_id = $2`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var currentPage, totalPages int
	err := m.DB.QueryRowContext(ctx, query, userID, bookID).Scan(&currentPage, &totalPages)
	if err != nil {
		if err == sql.ErrNoRows {
			return 1, 0, nil
		}
		return 0, 0, err
	}
	return currentPage, totalPages, nil
}