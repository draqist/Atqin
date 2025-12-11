package data

import (
	"context"
	"database/sql"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// Waitlist represents an entry in the pre-launch waitlist.
type Waitlist struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// WaitlistModel wraps the database connection pool for Waitlist-related operations.
type WaitlistModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

// Insert adds a new email to the waitlist.
func (m WaitlistModel) Insert(email string) error {
	query := `
		INSERT INTO waitlist (email)
		VALUES ($1)
		RETURNING id, created_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var waitlist Waitlist
	return m.DB.QueryRowContext(ctx, query, email).Scan(&waitlist.ID, &waitlist.CreatedAt)
}
