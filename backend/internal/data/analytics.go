package data

import (
	"context"
	"database/sql"
	"time"
)

// StudentStats aggregates statistics for a student's dashboard.
type StudentStats struct {
	TotalMinutes      int             `json:"total_minutes"`
	CurrentStreak     int             `json:"current_streak"`
	BooksOpened       int             `json:"books_opened"`
	ActivityLast7Days []DailyActivity `json:"activity_chart"`
	LastBookOpened    *Book           `json:"last_book_opened"`
	LastBookProgress  *BookProgress   `json:"last_book_progress"`
}

// BookProgress represents the user's progress in a specific book.
type BookProgress struct {
	CurrentPage int `json:"current_page"`
	TotalPages  int `json:"total_pages"`
	Percentage  int `json:"percentage"`
}

// AdminStats aggregates high-level statistics for the admin dashboard.
type AdminStats struct {
	TotalBooks        int `json:"total_books"`
	TotalResources    int `json:"total_resources"`
	TotalStudents     int `json:"total_students"`
	BooksThisWeek     int `json:"books_this_week"`
	ResourcesThisWeek int `json:"resources_this_week"`
	StudentsGrowthPct int `json:"students_growth_pct"`
}

// AdminDashboardData contains all data required for the admin dashboard view.
type AdminDashboardData struct {
	Stats           AdminStats  `json:"stats"`
	RecentResources []*Resource `json:"recent_resources"`
	RecentUsers     []*User     `json:"recent_users"`
}

// DailyActivity represents the minutes spent learning on a specific date.
type DailyActivity struct {
	Date    string `json:"date"` // "Mon", "Tue" or ISO date
	Minutes int    `json:"minutes"`
}

// AnalyticsModel wraps the database connection pool for Analytics-related operations.
type AnalyticsModel struct {
	DB *sql.DB
}

// LogActivity records or updates the minutes spent by a user on a book for the current day.
func (m AnalyticsModel) LogActivity(userID, bookID string, minutes int) error {
	query := `
		INSERT INTO activity_logs (user_id, book_id, date, minutes_spent, updated_at)
		VALUES ($1, $2, CURRENT_DATE, $3, NOW())
		ON CONFLICT (user_id, book_id, date)
		DO UPDATE SET 
			minutes_spent = activity_logs.minutes_spent + EXCLUDED.minutes_spent,
			updated_at = NOW()`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, bookID, minutes)
	return err
}

// GetStudentStats calculates and returns dashboard statistics for a specific student.
func (m AnalyticsModel) GetStudentStats(userID string) (*StudentStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stats := &StudentStats{}

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

	stats.CurrentStreak = 0 // Placeholder for now

	queryLastBook := `
		SELECT b.id, b.title, b.original_author, COALESCE(b.description, ''), COALESCE(b.cover_image_url, ''), COALESCE(b.metadata, '{}'), b.is_public, b.created_at, b.version
		FROM activity_logs a
		JOIN books b ON a.book_id = b.id
		WHERE a.user_id = $1
		ORDER BY a.updated_at DESC
		LIMIT 1`

	var lastBook Book
	err = m.DB.QueryRowContext(ctx, queryLastBook, userID).Scan(
		&lastBook.ID,
		&lastBook.Title,
		&lastBook.OriginalAuthor,
		&lastBook.Description,
		&lastBook.CoverImageURL,
		&lastBook.Metadata,
		&lastBook.IsPublic,
		&lastBook.CreatedAt,
		&lastBook.Version,
	)

	if err == nil {
		stats.LastBookOpened = &lastBook

		queryProgress := `
			SELECT current_page, total_pages
			FROM user_book_progress
			WHERE user_id = $1 AND book_id = $2`

		var p BookProgress
		err = m.DB.QueryRowContext(ctx, queryProgress, userID, lastBook.ID).Scan(&p.CurrentPage, &p.TotalPages)
		if err == nil && p.TotalPages > 0 {
			p.Percentage = int((float64(p.CurrentPage) / float64(p.TotalPages)) * 100)
			stats.LastBookProgress = &p
		}
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	return stats, nil
}

// GetSystemStats returns global statistics for the admin dashboard.
func (m AnalyticsModel) GetSystemStats() (*AdminStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stats := &AdminStats{}

	queryBooks := `SELECT COUNT(*) FROM books`
	err := m.DB.QueryRowContext(ctx, queryBooks).Scan(&stats.TotalBooks)
	if err != nil {
		return nil, err
	}

	queryResources := `SELECT COUNT(*) FROM resources`
	err = m.DB.QueryRowContext(ctx, queryResources).Scan(&stats.TotalResources)
	if err != nil {
		return nil, err
	}

	queryStudents := `SELECT COUNT(*) FROM users WHERE role = 'student'`
	err = m.DB.QueryRowContext(ctx, queryStudents).Scan(&stats.TotalStudents)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// GetDashboardData aggregates all necessary data for the admin dashboard view.
func (m AnalyticsModel) GetDashboardData() (*AdminDashboardData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	data := &AdminDashboardData{
		RecentResources: []*Resource{},
		RecentUsers:     []*User{},
	}

	queryTotals := `
		SELECT 
			(SELECT COUNT(*) FROM books),
			(SELECT COUNT(*) FROM resources),
			(SELECT COUNT(*) FROM users WHERE role = 'student'),
			(SELECT COUNT(*) FROM books WHERE created_at > NOW() - INTERVAL '7 days'),
			(SELECT COUNT(*) FROM resources WHERE created_at > NOW() - INTERVAL '7 days'),
			(
				SELECT CASE 
					WHEN (SELECT COUNT(*) FROM users WHERE role = 'student' AND created_at < NOW() - INTERVAL '30 days') = 0 THEN 100
					ELSE (
						(SELECT COUNT(*) FROM users WHERE role = 'student') - (SELECT COUNT(*) FROM users WHERE role = 'student' AND created_at < NOW() - INTERVAL '30 days')
					) * 100 / (SELECT COUNT(*) FROM users WHERE role = 'student' AND created_at < NOW() - INTERVAL '30 days')
				END
			)`

	err := m.DB.QueryRowContext(ctx, queryTotals).Scan(
		&data.Stats.TotalBooks,
		&data.Stats.TotalResources,
		&data.Stats.TotalStudents,
		&data.Stats.BooksThisWeek,
		&data.Stats.ResourcesThisWeek,
		&data.Stats.StudentsGrowthPct,
	)
	if err != nil {
		return nil, err
	}

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