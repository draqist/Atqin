package data

import (
	"context"
	"database/sql"
	"time"
)

type BookmarkModel struct {
	DB *sql.DB
}

// Toggle adds the bookmark if it doesn't exist, or removes it if it does.
// Returns true if bookmarked, false if removed.
func (m BookmarkModel) Toggle(userID, bookID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// 1. Check if exists
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM bookmarks WHERE user_id = $1 AND book_id = $2)`
	err := m.DB.QueryRowContext(ctx, checkQuery, userID, bookID).Scan(&exists)
	if err != nil {
		return false, err
	}

	if exists {
		// 2. Remove
		deleteQuery := `DELETE FROM bookmarks WHERE user_id = $1 AND book_id = $2`
		_, err := m.DB.ExecContext(ctx, deleteQuery, userID, bookID)
		return false, err
	} else {
		// 3. Add
		insertQuery := `INSERT INTO bookmarks (user_id, book_id) VALUES ($1, $2)`
		_, err := m.DB.ExecContext(ctx, insertQuery, userID, bookID)
		return true, err
	}
}

// GetUserBookmarks fetches the list of books a user has saved
// We reuse the 'Book' struct from books.go
func (m BookmarkModel) GetUserBookmarks(userID string) ([]*Book, error) {
	query := `
		SELECT b.id, b.title, b.original_author, COALESCE(b.description, ''), COALESCE(b.cover_image_url, ''), COALESCE(b.metadata, '{}'), b.is_public, b.created_at, b.version
		FROM books b
		JOIN bookmarks bm ON b.id = bm.book_id
		WHERE bm.user_id = $1
		ORDER BY bm.created_at DESC`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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
	return books, nil
}