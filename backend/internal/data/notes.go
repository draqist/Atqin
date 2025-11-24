package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"
)

type Note struct {
	ID          string          `json:"id"`
	BookID      string          `json:"book_id"`
	UserID      string          `json:"user_id"`
	Title       string          `json:"title"`
	Content     json.RawMessage `json:"content"` // Stores the Tiptap JSON
	Description string          `json:"description"`
	IsPublished bool            `json:"is_published"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type PublicNote struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	AuthorName  string    `json:"author_name"` // We need this from the users table
	CreatedAt   time.Time `json:"created_at"`
}

type NoteModel struct {
	DB *sql.DB
}

// GetDraft fetches the latest draft for a specific book and user
func (m NoteModel) GetDraft(bookID, userID string) (*Note, error) {
	query := `
		SELECT id, book_id, user_id, title, content, description, is_published, created_at, updated_at
		FROM notes
		WHERE book_id = $1 AND user_id = $2
		ORDER BY updated_at DESC
		LIMIT 1`

	var n Note
	// We use a byte slice for content to handle JSONB from Postgres
	var content []byte 
	var title,description sql.NullString

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

// Save (Upsert) creates a new note or updates an existing one
func (m NoteModel) Save(note *Note) error {
	// Check if a note already exists for this ID
	if note.ID != "" {
		return m.update(note)
	}
	return m.insert(note)
}

func (m NoteModel) insert(note *Note) error {
    // FIX: Postgres crashes if JSONB is an empty string. 
    // If content is empty/nil, force it to be an empty JSON object.
    if len(note.Content) == 0 || string(note.Content) == "null" {
        note.Content = []byte("{}")
    }

    query := `
        INSERT INTO notes (book_id, user_id, title, description, content, is_published)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at`

    // Note: We pass note.Title/Description directly. 
    // Go empty strings "" are valid for Postgres TEXT columns (they just become empty strings).
    // We only need to be careful with the JSONB column.
    args := []any{
        note.BookID, 
        note.UserID, 
        note.Title,       // Can be ""
        note.Description, // Can be ""
        note.Content,     // Must be valid JSON
        note.IsPublished,
    }

    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    return m.DB.QueryRowContext(ctx, query, args...).Scan(&note.ID, &note.CreatedAt, &note.UpdatedAt)
}

func (m NoteModel) update(note *Note) error {
    // FIX: Same safety check for updates
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

    return m.DB.QueryRowContext(ctx, query, 
        note.Title, 
        note.Description, 
        note.Content, 
        note.IsPublished, // Ensure we update published status too
        note.ID,
    ).Scan(&note.UpdatedAt)
}

// GetPublished fetches all published notes for a book
func (m NoteModel) GetPublished(bookID string) ([]*PublicNote, error) {
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

	var notes []*PublicNote
	for rows.Next() {
		var n PublicNote
		// Handle nullable description if necessary, but we assume published notes have them
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

	return notes, nil
}

// Enhanced struct for the Global Feed (includes Book Title)
type GlobalNote struct {
	ID          string          `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	AuthorName  string          `json:"author_name"`
	BookTitle   string          `json:"book_title"`
	BookID      string          `json:"book_id"`
	CreatedAt   time.Time       `json:"created_at"`
	Content     json.RawMessage `json:"content,omitempty"` // <--- ADD THIS
}
// GetAllPublished fetches the latest notes from the entire platform
// Define a filter struct to keep things tidy
type NoteFilters struct {
	Category string
	Search   string
}

// Update the function signature
func (m NoteModel) GetAllPublished(filters NoteFilters) ([]*GlobalNote, error) {
	// Base query
	query := `
		SELECT n.id, n.title, n.description, u.name, b.title, b.id, n.created_at
		FROM notes n
		JOIN users u ON n.user_id = u.id
		JOIN books b ON n.book_id = b.id
		WHERE n.is_published = TRUE
		-- Filter by Category (if provided)
		AND ($1 = '' OR b.metadata->>'category' = $1)
		-- Search by Book Title OR Author Name (if provided)
		AND ($2 = '' OR (b.title ILIKE '%' || $2 || '%' OR u.name ILIKE '%' || $2 || '%'))
		ORDER BY n.created_at DESC
		LIMIT 50`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Pass filters to arguments
	rows, err := m.DB.QueryContext(ctx, query, filters.Category, filters.Search)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*GlobalNote
	for rows.Next() {
		var n GlobalNote
		var description sql.NullString 
		err := rows.Scan(&n.ID, &n.Title, &description, &n.AuthorName, &n.BookTitle, &n.BookID, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		if description.Valid { n.Description = description.String }
		notes = append(notes, &n)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return notes, nil
}

// GetPublicByID fetches a single published note
func (m NoteModel) GetPublicByID(noteID string) (*GlobalNote, error) {
	query := `
		SELECT n.id, n.title, n.description, u.name, b.title, b.id, n.created_at, n.content
		FROM notes n
		JOIN users u ON n.user_id = u.id
		JOIN books b ON n.book_id = b.id
		WHERE n.id = $1 AND n.is_published = TRUE`

	var n GlobalNote
	var content []byte // Holds the raw JSON bytes from DB
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
		&content, // Scan into the byte slice
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

	// CRITICAL FIX: Assign the bytes to the struct field
	if len(content) > 0 {
		n.Content = json.RawMessage(content)
	}

	return &n, nil
}