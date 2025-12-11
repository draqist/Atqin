package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// Notification represents a system notification for a user.
type Notification struct {
	ID        string          `json:"id"`
	UserID    string          `json:"user_id"`
	Type      string          `json:"type"`
	Title     string          `json:"title"`
	Message   string          `json:"message"`
	Data      json.RawMessage `json:"data"`
	IsRead    bool            `json:"is_read"`
	CreatedAt time.Time       `json:"created_at"`
}

// NotificationModel wraps the database connection pool for Notification-related operations.
type NotificationModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

// Insert adds a new notification to the database.
func (m NotificationModel) Insert(n *Notification) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at`

	return m.DB.QueryRowContext(ctx, query, n.UserID, n.Type, n.Title, n.Message, n.Data, n.IsRead).Scan(&n.ID, &n.CreatedAt)
}

// GetForUser fetches the latest 50 notifications for a specific user.
func (m NotificationModel) GetForUser(userID string) ([]*Notification, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, type, title, message, data, is_read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50`

	rows, err := m.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Data, &n.IsRead, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, &n)
	}
	return notifications, nil
}

// MarkRead marks a specific notification as read.
func (m NotificationModel) MarkRead(id string, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`
	_, err := m.DB.ExecContext(ctx, query, id, userID)
	return err
}

// MarkAllRead marks all notifications for a user as read.
func (m NotificationModel) MarkAllRead(userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE notifications SET is_read = true WHERE user_id = $1`
	_, err := m.DB.ExecContext(ctx, query, userID)
	return err
}
