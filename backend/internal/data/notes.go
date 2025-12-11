package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// Note represents a user's personal reflection or note on a book.
type Note struct {
	ID          string          `json:"id"`
	BookID      string          `json:"book_id"`
	UserID      string          `json:"user_id"`
	Title       string          `json:"title"`
	Content     json.RawMessage `json:"content"`
	Description string          `json:"description"`
	IsPublished bool            `json:"is_published"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// PublicNote represents a simplified view of a published note for public display.
type PublicNote struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	AuthorName  string    `json:"author_name"`
	CreatedAt   time.Time `json:"created_at"`
}

// NoteModel wraps the database connection pool for Note-related operations.
type NoteModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

// GetDraft fetches the latest draft note for a specific book and user.
// It returns the most recently updated note.
func (m NoteModel) GetDraft(bookID, userID string) (*Note, error) {
	query := `
		SELECT id, book_id, user_id, title, content, description, is_published, created_at, updated_at
		FROM notes
		WHERE book_id = $1 AND user_id = $2
		ORDER BY updated_at DESC
		LIMIT 1`

	var n Note
	var content []byte
	var title, description sql.NullString

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, bookID, userID).Scan(
		&n.ID,
		&n.BookID,
		&n.UserID,
		&title,
		&content,
		&description,
		&n.IsPublished,
		&n.CreatedAt,
		&n.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	if title.Valid {
		n.Title = title.String
	}
	if description.Valid {
		n.Description = description.String
	}
	n.Content = json.RawMessage(content)
	return &n, nil
}

// Save creates a new note or updates an existing one (Upsert).
func (m NoteModel) Save(note *Note) error {
	if note.ID != "" {
		return m.update(note)
	}
	return m.insert(note)
}

func (m NoteModel) insert(note *Note) error {
	if len(note.Content) == 0 || string(note.Content) == "null" {
		note.Content = []byte("{}")
	}

	query := `
        INSERT INTO notes (book_id, user_id, title, description, content, is_published)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at`

	args := []any{
		note.BookID,
		note.UserID,
		note.Title,
		note.Description,
		note.Content,
		note.IsPublished,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&note.ID, &note.CreatedAt, &note.UpdatedAt)
	if err != nil {
		return err
	}

	// Invalidate: This new note might be published, so invalidate book's note list
	return m.Cache.Delete(context.Background(), fmt.Sprintf("notes:published:book:%s", note.BookID))
}

func (m NoteModel) update(note *Note) error {
	if len(note.Content) == 0 || string(note.Content) == "null" {
		note.Content = []byte("{}")
	}

	query := `
        UPDATE notes 
        SET title = $1, description = $2, content = $3, is_published = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING updated_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query,
		note.Title,
		note.Description,
		note.Content,
		note.IsPublished,
		note.ID,
	).Scan(&note.UpdatedAt)
	if err != nil {
		return err
	}

	// Invalidate: note specific cache and book's note list
	m.Cache.Delete(context.Background(), fmt.Sprintf("note:public:%s", note.ID))
	return m.Cache.Delete(context.Background(), fmt.Sprintf("notes:published:book:%s", note.BookID))
}

// GetPublished fetches all published notes associated with a specific book.
func (m NoteModel) GetPublished(bookID string) ([]*PublicNote, error) {
	// 1. Try Cache
	var notes []*PublicNote
	cacheKey := fmt.Sprintf("notes:published:book:%s", bookID)
	if m.Cache.Get(context.Background(), cacheKey, &notes) {
		return notes, nil
	}

	query := `
		SELECT n.id, n.title, n.description, u.name, n.created_at
		FROM notes n
		JOIN users u ON n.user_id = u.id
		WHERE n.book_id = $1 AND n.is_published = TRUE
		ORDER BY n.created_at DESC`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	notes = []*PublicNote{}
	for rows.Next() {
		var n PublicNote
		var description sql.NullString

		err := rows.Scan(&n.ID, &n.Title, &description, &n.AuthorName, &n.CreatedAt)
		if err != nil {
			return nil, err
		}

		if description.Valid {
			n.Description = description.String
		}

		notes = append(notes, &n)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// 2. Set Cache
	m.Cache.Set(context.Background(), cacheKey, notes, 1*time.Hour)

	return notes, nil
}

// GlobalNote represents a published note with additional context like book title.
// Used for the global feed.
type GlobalNote struct {
	ID          string          `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	AuthorName  string          `json:"author_name"`
	BookTitle   string          `json:"book_title"`
	BookID      string          `json:"book_id"`
	CreatedAt   time.Time       `json:"created_at"`
	Content     json.RawMessage `json:"content,omitempty"`
}

// NoteFilters defines criteria for filtering global notes.
type NoteFilters struct {
	Category string
	Search   string
	Filters
}

// GetAllPublished fetches a paginated list of published notes from all users.
// It supports filtering by category and searching by book title or author name.
func (m NoteModel) GetAllPublished(filters NoteFilters) ([]*GlobalNote, Metadata, error) {
	query := `
		SELECT count(*) OVER(), n.id, n.title, n.description, u.name, b.title, b.id, n.created_at
		FROM notes n
		JOIN users u ON n.user_id = u.id
		JOIN books b ON n.book_id = b.id
		WHERE n.is_published = TRUE
		AND ($1 = '' OR b.metadata->>'category' = $1)
		AND ($2 = '' OR (b.title ILIKE '%' || $2 || '%' OR u.name ILIKE '%' || $2 || '%'))
		ORDER BY n.created_at DESC
		LIMIT $3 OFFSET $4`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, filters.Category, filters.Search, filters.Limit(), filters.Offset())
	if err != nil {
		return nil, Metadata{}, err
	}
	defer rows.Close()

	notes := []*GlobalNote{}
	totalRecords := 0
	for rows.Next() {
		var n GlobalNote
		var description sql.NullString
		err := rows.Scan(&totalRecords, &n.ID, &n.Title, &description, &n.AuthorName, &n.BookTitle, &n.BookID, &n.CreatedAt)
		if err != nil {
			return nil, Metadata{}, err
		}
		if description.Valid {
			n.Description = description.String
		}
		notes = append(notes, &n)
	}

	if err = rows.Err(); err != nil {
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return notes, metadata, nil
}

// GetPublicByID fetches a single published note by its ID.
// It includes the full content of the note.
func (m NoteModel) GetPublicByID(noteID string) (*GlobalNote, error) {
	// 1. Try Cache
	var n GlobalNote
	cacheKey := fmt.Sprintf("note:public:%s", noteID)
	if m.Cache.Get(context.Background(), cacheKey, &n) {
		return &n, nil
	}

	query := `
		SELECT n.id, n.title, n.description, u.name, b.title, b.id, n.created_at, n.content
		FROM notes n
		JOIN users u ON n.user_id = u.id
		JOIN books b ON n.book_id = b.id
		WHERE n.id = $1 AND n.is_published = TRUE`


	var content []byte
	var description sql.NullString

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, noteID).Scan(
		&n.ID,
		&n.Title,
		&description,
		&n.AuthorName,
		&n.BookTitle,
		&n.BookID,
		&n.CreatedAt,
		&content,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	if description.Valid {
		n.Description = description.String
	}

	if len(content) > 0 {
		n.Content = json.RawMessage(content)
	}

	// 2. Set Cache
	m.Cache.Set(context.Background(), cacheKey, &n, 1*time.Hour)

	return &n, nil
}

// HasPublishedNote checks if a user has published a note for a specific book.
// It returns true if at least one published note exists.
func (m NoteModel) HasPublishedNote(userID, bookID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM notes WHERE user_id = $1 AND book_id = $2 AND is_published = TRUE)`

	var exists bool
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, userID, bookID).Scan(&exists)
	return exists, err
}