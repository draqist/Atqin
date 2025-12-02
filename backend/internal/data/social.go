package data

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

// Structs representing the DB tables
type Cohort struct {
	ID        string    `json:"id"`
	RoadmapID string    `json:"roadmap_id"`
	Pace      string    `json:"pace"` // 'casual', 'dedicated', 'intensive'
	StartDate time.Time `json:"start_date"`
}

type CohortMember struct {
	UserID          string    `json:"user_id"`
	UserName        string    `json:"user_name"` // Joined from users table
	CurrentProgress int       `json:"current_progress"`
	LastActiveAt    time.Time `json:"last_active_at"`
}

type SocialModel struct {
	DB *sql.DB
}

// 1. Find or Create a Cohort (The "Sorting Hat" Logic)
// It looks for a cohort starting this week with the same pace. If none, creates one.
func (m SocialModel) GetOrCreateCohort(roadmapID, pace string) (*Cohort, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// A. Try to find an open cohort (started in the last 7 days)
	queryFind := `
		SELECT id, roadmap_id, pace, start_date
		FROM cohorts
		WHERE roadmap_id = $1 AND pace = $2
		AND start_date > NOW() - INTERVAL '7 days'
		LIMIT 1`

	var c Cohort
	err := m.DB.QueryRowContext(ctx, queryFind, roadmapID, pace).Scan(&c.ID, &c.RoadmapID, &c.Pace, &c.StartDate)

	if err == nil {
		return &c, nil // Found one!
	}

	if !errors.Is(err, sql.ErrNoRows) {
		return nil, err // Real DB error
	}

	// B. No cohort found, create a new one
	queryCreate := `
		INSERT INTO cohorts (roadmap_id, pace, start_date)
		VALUES ($1, $2, CURRENT_DATE)
		RETURNING id, roadmap_id, pace, start_date`

	err = m.DB.QueryRowContext(ctx, queryCreate, roadmapID, pace).Scan(&c.ID, &c.RoadmapID, &c.Pace, &c.StartDate)
	if err != nil {
		return nil, err
	}

	return &c, nil
}

// 2. Join a Cohort
func (m SocialModel) JoinCohort(cohortID, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO cohort_members (cohort_id, user_id, current_progress, last_active_at)
		VALUES ($1, $2, 0, NOW())
		ON CONFLICT (cohort_id, user_id) DO NOTHING`

	_, err := m.DB.ExecContext(ctx, query, cohortID, userID)
	return err
}

// 3. Get My Cohort (For Dashboard Widget)
// Returns the list of classmates for a specific roadmap's active cohort
func (m SocialModel) GetCohortPeers(userID, roadmapID string) ([]*CohortMember, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Logic: Find the cohort this user is in for this roadmap, then get all members
	query := `
		SELECT u.id, u.name, cm.current_progress, cm.last_active_at
		FROM cohort_members cm
		JOIN users u ON cm.user_id = u.id
		WHERE cm.cohort_id = (
			SELECT cm2.cohort_id 
			FROM cohort_members cm2
			JOIN cohorts c ON cm2.cohort_id = c.id
			WHERE cm2.user_id = $1 AND c.roadmap_id = $2
			LIMIT 1
		)
		ORDER BY cm.current_progress DESC
		LIMIT 10`

	rows, err := m.DB.QueryContext(ctx, query, userID, roadmapID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*CohortMember
	for rows.Next() {
		var m CohortMember
		if err := rows.Scan(&m.UserID, &m.UserName, &m.CurrentProgress, &m.LastActiveAt); err != nil {
			return nil, err
		}
		members = append(members, &m)
	}

	return members, nil
}

// --- PARTNER LOGIC ---

type Partner struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	UserName      string    `json:"user_name"`
	Status        string    `json:"status"` // 'pending', 'accepted'
	Streak        int       `json:"streak"`
	LastActive    time.Time `json:"last_active_at"`
	InitiatedByMe bool      `json:"initiated_by_me"` // NEW
}

// 4. Invite Partner (by UserID)
func (m SocialModel) InvitePartner(requesterID, targetUserID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if targetUserID == requesterID {
		return errors.New("cannot invite yourself")
	}

	// 2. Create Relationship (Pending)
	// We store requester as user_id_1
	query := `
		INSERT INTO partners (user_id_1, user_id_2, status)
		VALUES ($1, $2, 'pending')
		ON CONFLICT (user_id_1, user_id_2) DO NOTHING`
	
	_, err := m.DB.ExecContext(ctx, query, requesterID, targetUserID)
	return err
}

// 5. Accept Partner
func (m SocialModel) AcceptPartner(userID, partnerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Update status to accepted where user is the invitee (user_id_2)
	query := `
		UPDATE partners 
		SET status = 'accepted', updated_at = NOW()
		WHERE id = $1 AND user_id_2 = $2`

	result, err := m.DB.ExecContext(ctx, query, partnerID, userID)
	if err != nil {
		return err
	}
	
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("invite not found or already accepted")
	}
	return nil
}

// 6. Get Partner Status
func (m SocialModel) GetPartner(userID string) (*Partner, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Find any relationship where user is 1 or 2
	query := `
		SELECT p.id, p.status, p.user_id_1, u.id, u.name
		FROM partners p
		JOIN users u ON (CASE WHEN p.user_id_1 = $1 THEN p.user_id_2 ELSE p.user_id_1 END) = u.id
		WHERE p.user_id_1 = $1 OR p.user_id_2 = $1
		LIMIT 1`

	var p Partner
	var partnerUserID string
	var initiatorID string
	
	err := m.DB.QueryRowContext(ctx, query, userID).Scan(&p.ID, &p.Status, &initiatorID, &partnerUserID, &p.UserName)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // No partner
		}
		return nil, err
	}
	
	p.UserID = partnerUserID
	p.InitiatedByMe = (initiatorID == userID)

	// Calculate Streak (Mock logic for now, or simple query)
	p.Streak = 0 
	
	return &p, nil
}