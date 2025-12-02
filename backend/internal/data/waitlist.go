package data

import (
	"context"
	"database/sql"
	"time"
)

type Waitlist struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type WaitlistModel struct {
	DB *sql.DB
}

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
