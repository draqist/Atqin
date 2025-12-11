package data

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

type FeatureRequest struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // 'planned', 'in_progress', 'completed', 'under_review'
	Votes       int       `json:"votes"`
	UserID      string    `json:"user_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	HasVoted    bool      `json:"has_voted,omitempty"` // Computed field for current user
}

type FeatureRequestModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

func (m FeatureRequestModel) Insert(request *FeatureRequest) error {
	query := `
		INSERT INTO feature_requests (title, description, user_id, status, votes)
		VALUES ($1, $2, $3, 'under_review', 0)
		RETURNING id, created_at, updated_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, request.Title, request.Description, request.UserID).Scan(
		&request.ID,
		&request.CreatedAt,
		&request.UpdatedAt,
	)
}

func (m FeatureRequestModel) GetAll(currentUserID string) ([]*FeatureRequest, error) {
	query := `
		SELECT 
			f.id, f.title, f.description, f.status, f.votes, f.user_id, f.created_at, f.updated_at,
			EXISTS(SELECT 1 FROM feature_votes v WHERE v.feature_request_id = f.id AND v.user_id = $1) as has_voted
		FROM feature_requests f
		ORDER BY f.votes DESC, f.created_at DESC`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// If currentUserID is empty, we pass a UUID that won't match (or handle it in query)
	// But simpler to just pass it, if empty string it won't match any UUID in DB usually, 
	// but Postgres might complain about invalid UUID syntax if we pass empty string to UUID column comparison.
	// So let's handle empty userID by passing a nil or dummy UUID if needed, or better, use a different query.
	// Actually, $1 is compared to v.user_id (UUID). Empty string "" is not valid UUID.
	
	var rows *sql.Rows
	var err error

	if currentUserID == "" {
		// Public view, no voting info
		queryNoAuth := `
			SELECT id, title, description, status, votes, user_id, created_at, updated_at, false
			FROM feature_requests
			ORDER BY votes DESC, created_at DESC`
		rows, err = m.DB.QueryContext(ctx, queryNoAuth)
	} else {
		rows, err = m.DB.QueryContext(ctx, query, currentUserID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := []*FeatureRequest{}
	for rows.Next() {
		var r FeatureRequest
		err := rows.Scan(
			&r.ID,
			&r.Title,
			&r.Description,
			&r.Status,
			&r.Votes,
			&r.UserID,
			&r.CreatedAt,
			&r.UpdatedAt,
			&r.HasVoted,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, &r)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return requests, nil
}

func (m FeatureRequestModel) Vote(userID, featureID string) error {
	// Transaction to ensure vote count matches table
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Check if already voted
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM feature_votes WHERE user_id = $1 AND feature_request_id = $2)`
	err = tx.QueryRowContext(ctx, checkQuery, userID, featureID).Scan(&exists)
	if err != nil {
		return err
	}

	if exists {
		// Remove vote (Toggle off)
		_, err = tx.ExecContext(ctx, `DELETE FROM feature_votes WHERE user_id = $1 AND feature_request_id = $2`, userID, featureID)
		if err != nil {
			return err
		}
		_, err = tx.ExecContext(ctx, `UPDATE feature_requests SET votes = votes - 1 WHERE id = $1`, featureID)
		if err != nil {
			return err
		}
	} else {
		// Add vote
		_, err = tx.ExecContext(ctx, `INSERT INTO feature_votes (user_id, feature_request_id) VALUES ($1, $2)`, userID, featureID)
		if err != nil {
			return err
		}
		_, err = tx.ExecContext(ctx, `UPDATE feature_requests SET votes = votes + 1 WHERE id = $1`, featureID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (m FeatureRequestModel) UpdateStatus(id, status string) error {
	query := `UPDATE feature_requests SET status = $1, updated_at = NOW() WHERE id = $2`
	
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, status, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("record not found")
	}

	return nil
}
