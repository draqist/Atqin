package data

import (
	"context"
	"database/sql"
	"time"
)

type StudentStats struct {
	TotalMinutes      int `json:"total_minutes"`
	CurrentStreak     int `json:"current_streak"`
	BooksOpened       int `json:"books_opened"`
	ActivityLast7Days []DailyActivity `json:"activity_chart"`
}

type DailyActivity struct {
	Date    string `json:"date"` // "Mon", "Tue" or ISO date
	Minutes int    `json:"minutes"`
}

type AnalyticsModel struct {
	DB *sql.DB
}

// LogActivity increments the minutes_spent for today
func (m AnalyticsModel) LogActivity(userID, bookID string, minutes int) error {
	// Upsert Logic: Insert 0 if missing, then Add minutes
	query := `
		INSERT INTO activity_logs (user_id, book_id, date, minutes_spent)
		VALUES ($1, $2, CURRENT_DATE, $3)
		ON CONFLICT (user_id, book_id, date)
		DO UPDATE SET minutes_spent = activity_logs.minutes_spent + EXCLUDED.minutes_spent`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, bookID, minutes)
	return err
}

// GetStudentStats calculates the dashboard numbers
func (m AnalyticsModel) GetStudentStats(userID string) (*StudentStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stats := &StudentStats{}

	// 1. Total Minutes & Books Opened
	queryTotals := `
		SELECT 
			COALESCE(SUM(minutes_spent), 0), 
			COUNT(DISTINCT book_id)
		FROM activity_logs 
		WHERE user_id = $1`
	
	err := m.DB.QueryRowContext(ctx, queryTotals, userID).Scan(&stats.TotalMinutes, &stats.BooksOpened)
	if err != nil {
		return nil, err
	}

	// 2. Last 7 Days Chart
	// We generate a series of the last 7 days and left join our logs
	queryChart := `
		SELECT 
			TO_CHAR(d.day, 'Dy'), -- 'Mon', 'Tue'
			COALESCE(SUM(a.minutes_spent), 0)
		FROM (
			SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
		) d
		LEFT JOIN activity_logs a ON a.date = d.day AND a.user_id = $1
		GROUP BY d.day
		ORDER BY d.day ASC`

	rows, err := m.DB.QueryContext(ctx, queryChart, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var d DailyActivity
		if err := rows.Scan(&d.Date, &d.Minutes); err != nil {
			return nil, err
		}
		stats.ActivityLast7Days = append(stats.ActivityLast7Days, d)
	}

	// 3. Simple Streak Calculation (Consecutive days with activity)
	// (This is a simplified query for MVP. Real streak logic is complex in SQL)
	// We just check if they studied today or yesterday to say "Active"
	stats.CurrentStreak = 0 // Placeholder for now, can be improved later

	return stats, nil
}