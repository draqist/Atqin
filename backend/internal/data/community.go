package data

import (
	"context"
	"database/sql"
	"time"
)

// Discussion represents a top-level thread
type Discussion struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	UserName    string    `json:"user_name"`       // Joined from Users table
	UserRole    string    `json:"user_role"`       // Useful for highlighting Admin/Sheikh posts
	ContextType string    `json:"context_type"`
	ContextID   string    `json:"context_id"`
	Title       string    `json:"title"`           // Can be empty
	Body        string    `json:"body"`
	ReplyCount  int       `json:"reply_count"`
	LastReplyAt time.Time `json:"last_reply_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// Reply represents a comment within a thread
type Reply struct {
	ID           string    `json:"id"`
	DiscussionID string    `json:"discussion_id"`
	UserID       string    `json:"user_id"`
	UserName     string    `json:"user_name"`
	UserRole     string    `json:"user_role"`
	Body         string    `json:"body"`
	CreatedAt    time.Time `json:"created_at"`
}

type CommunityModel struct {
	DB *sql.DB
}

// CreateDiscussion inserts a new thread and returns its ID
func (m CommunityModel) CreateDiscussion(d *Discussion) error {
	query := `
		INSERT INTO discussions (user_id, context_type, context_id, title, body, last_reply_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at, last_reply_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, d.UserID, d.ContextType, d.ContextID, d.Title, d.Body).
		Scan(&d.ID, &d.CreatedAt, &d.LastReplyAt)
}

// GetContextDiscussions fetches threads for a specific context (e.g., Book ID)
func (m CommunityModel) GetContextDiscussions(contextType, contextID string) ([]*Discussion, error) {
	// We JOIN users to get the name/role instantly without N+1 queries
	query := `
		SELECT 
			d.id, d.user_id, u.name, u.role, 
			d.context_type, d.context_id, 
			COALESCE(d.title, ''), d.body, 
			d.reply_count, d.last_reply_at, d.created_at
		FROM discussions d
		JOIN users u ON d.user_id = u.id
		WHERE d.context_type = $1 AND d.context_id = $2
		ORDER BY d.last_reply_at DESC -- Most active threads first
		LIMIT 50`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, contextType, contextID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var discussions []*Discussion
	for rows.Next() {
		var d Discussion
		err := rows.Scan(
			&d.ID, &d.UserID, &d.UserName, &d.UserRole,
			&d.ContextType, &d.ContextID,
			&d.Title, &d.Body,
			&d.ReplyCount, &d.LastReplyAt, &d.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		discussions = append(discussions, &d)
	}

	return discussions, nil
}

// CreateReply adds a comment and updates the parent thread's timestamp/count
func (m CommunityModel) CreateReply(r *Reply) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Use a transaction because we need to update two tables
	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() // Rollback if function exits early

	// 1. Insert Reply
	queryInsert := `
		INSERT INTO discussion_replies (discussion_id, user_id, body)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`
	
	err = tx.QueryRowContext(ctx, queryInsert, r.DiscussionID, r.UserID, r.Body).Scan(&r.ID, &r.CreatedAt)
	if err != nil {
		return err
	}

	// 2. Update Parent Discussion (Bump last_reply_at and increment count)
	queryUpdate := `
		UPDATE discussions 
		SET last_reply_at = NOW(), reply_count = reply_count + 1
		WHERE id = $1`
	
	_, err = tx.ExecContext(ctx, queryUpdate, r.DiscussionID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// GetReplies fetches comments for a specific thread
func (m CommunityModel) GetReplies(discussionID string) ([]*Reply, error) {
	query := `
		SELECT r.id, r.discussion_id, r.user_id, u.name, u.role, r.body, r.created_at
		FROM discussion_replies r
		JOIN users u ON r.user_id = u.id
		WHERE r.discussion_id = $1
		ORDER BY r.created_at ASC` // Oldest first (Chronological chat style)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, discussionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var replies []*Reply
	for rows.Next() {
		var r Reply
		err := rows.Scan(
			&r.ID, &r.DiscussionID, &r.UserID, &r.UserName, &r.UserRole, &r.Body, &r.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		replies = append(replies, &r)
	}

	return replies, nil
}