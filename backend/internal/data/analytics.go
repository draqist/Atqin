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
type AdminStats struct {
	TotalBooks     int `json:"total_books"`
	TotalResources int `json:"total_resources"`
	TotalStudents  int `json:"total_students"`
}

type AdminDashboardData struct {
	Stats           AdminStats      `json:"stats"`
	RecentResources []*Resource     `json:"recent_resources"`
	RecentUsers     []*User         `json:"recent_users"`
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
func (m AnalyticsModel) GetSystemStats() (*AdminStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stats := &AdminStats{}

	// 1. Count Books
	queryBooks := `SELECT COUNT(*) FROM books`
	err := m.DB.QueryRowContext(ctx, queryBooks).Scan(&stats.TotalBooks)
	if err != nil {
		return nil, err
	}

	// 2. Count Resources
	queryResources := `SELECT COUNT(*) FROM resources`
	err = m.DB.QueryRowContext(ctx, queryResources).Scan(&stats.TotalResources)
	if err != nil {
		return nil, err
	}

	// 3. Count Students (Users who are not admins)
	queryStudents := `SELECT COUNT(*) FROM users WHERE role = 'student'`
	err = m.DB.QueryRowContext(ctx, queryStudents).Scan(&stats.TotalStudents)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (m AnalyticsModel) GetDashboardData() (*AdminDashboardData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	data := &AdminDashboardData{
		RecentResources: []*Resource{}, // Initialize empty slices to avoid null JSON
		RecentUsers:     []*User{},
	}

	// 1. TOTAL COUNTS
	// We use subqueries to get everything in one round-trip if possible, 
	// but scanning into a struct is cleaner with separate query for totals.
	queryTotals := `
		SELECT 
			(SELECT COUNT(*) FROM books),
			(SELECT COUNT(*) FROM resources),
			(SELECT COUNT(*) FROM users WHERE role = 'student')`

	err := m.DB.QueryRowContext(ctx, queryTotals).Scan(
		&data.Stats.TotalBooks,
		&data.Stats.TotalResources,
		&data.Stats.TotalStudents,
	)
	if err != nil {
		return nil, err
	}

	// 2. RECENT RESOURCES (Last 5)
	// We fetch essential fields to display in the dashboard feed
	queryResources := `
		SELECT 
			id::text, 
			book_id::text, 
			type, 
			title, 
			url, 
			is_official, 
			created_at 
		FROM resources 
		ORDER BY created_at DESC 
		LIMIT 5`

	rowsRes, err := m.DB.QueryContext(ctx, queryResources)
	if err != nil {
		return nil, err
	}
	defer rowsRes.Close()

	for rowsRes.Next() {
		var r Resource
		// We scan only what we selected. 
		// Note: Resource struct usually has more fields, we leave them empty here.
		err := rowsRes.Scan(
			&r.ID, 
			&r.BookID, 
			&r.Type, 
			&r.Title, 
			&r.URL, 
			&r.IsOfficial, 
			&r.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		data.RecentResources = append(data.RecentResources, &r)
	}
	if err = rowsRes.Err(); err != nil {
		return nil, err
	}

	// 3. RECENT USERS (Last 5)
	queryUsers := `
		SELECT id, name, email, role, created_at 
		FROM users 
		ORDER BY created_at DESC 
		LIMIT 5`

	rowsUsers, err := m.DB.QueryContext(ctx, queryUsers)
	if err != nil {
		return nil, err
	}
	defer rowsUsers.Close()

	for rowsUsers.Next() {
		var u User
		// We need to scan password_hash placeholder if your struct tags don't ignore it, 
		// but usually we just scan the columns we selected into the fields we care about.
		// Assuming 'User' struct has these fields available:
		err := rowsUsers.Scan(
			&u.ID,
			&u.Name,
			&u.Email,
			&u.Role,
			&u.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		data.RecentUsers = append(data.RecentUsers, &u)
	}
	if err = rowsUsers.Err(); err != nil {
		return nil, err
	}

	return data, nil
}