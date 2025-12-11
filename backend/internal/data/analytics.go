package data

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// StudentStats aggregates statistics for a student's dashboard.
// StudentStats aggregates statistics for a student's dashboard.
type StudentStats struct {
	TotalMinutes      int             `json:"total_minutes"`
	CurrentStreak     int             `json:"current_streak"`
	LongestStreak     int             `json:"longest_streak"`      // <-- NEW
	TotalXP           int             `json:"total_xp"`            // <-- NEW
	CurrentLevel      int             `json:"current_level"`       // <-- NEW
	NextLevelProgress int             `json:"next_level_progress"` // <-- NEW (0-100%)
	BooksOpened       int             `json:"books_opened"`
	ActivityLast7Days []DailyActivity `json:"activity_chart"`
	LastBookOpened    *Book           `json:"last_book_opened"`
	LastBookProgress  *BookProgress   `json:"last_book_progress"`
}

const (
	XPPerMinute    = 10
	KeyDailyActive = "stats:daily_active:%s:%s" // stats:daily_active:{user_id}:{YYYY-MM-DD}
	KeySessionTime = "stats:session:%s"         // stats:session:{user_id}
)

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
	DB    *sql.DB
	Cache *cache.Service
}

// LogStudyHeartbeat replaces the old LogActivity.
// It uses Redis to track minutes cheaply and flushes to Postgres periodically.
func (m AnalyticsModel) LogStudyHeartbeat(userID, bookID string) error {
	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	// 1. Accumulate Time in Redis (Fast Write)
	// We use the cache service to increment. 
	// Note: Ensure your cache package has IncrBy. If not, use generic Do command.
	sessionKey := fmt.Sprintf(KeySessionTime, userID)
	
	// We blindly increment. If it fails (Redis down), we log error but don't crash.
	if err := m.Cache.IncrBy(ctx, sessionKey, 1); err != nil {
		return err 
	}

	// 2. Check & Update Streak (Once per day logic)
	// Key expires in 24h, so we only hit Postgres ONCE per day per user.
	dailyKey := fmt.Sprintf(KeyDailyActive, userID, today)
	
	if !m.Cache.Exists(ctx, dailyKey) {
		// This is the FIRST heartbeat of the day! Update DB streak.
		if err := m.updateStreakInDB(userID); err != nil {
			return err
		}
		// Mark as active in Redis
		m.Cache.Set(ctx, dailyKey, "1", 24*time.Hour)
	}

	// 3. Flush to DB logic (Write-Behind)
	// Check if we have accumulated enough minutes to verify a "session" (e.g., 5 mins)
	// This prevents spamming the DB with 1-minute updates.
	minutes, _ := m.Cache.GetInt(ctx, sessionKey)
	if minutes >= 5 {
		// Run in background so we don't block the HTTP request
		go m.FlushSessionToDB(userID, bookID, minutes)
	}

	return nil
}

// FlushSessionToDB moves temporary Redis stats into permanent Postgres storage
func (m AnalyticsModel) FlushSessionToDB(userID, bookID string, minutes int) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	xpEarned := minutes * XPPerMinute

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return // Log error in production
	}
	defer tx.Rollback()

	// 1. Update Aggregate Stats (XP, Minutes)
	// We create the row if it doesn't exist (upsert)
	queryStats := `
		INSERT INTO user_stats (user_id, total_minutes_studied, total_xp, last_study_date, updated_at)
		VALUES ($1, $2, $3, CURRENT_DATE, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			total_minutes_studied = user_stats.total_minutes_studied + $2,
			total_xp = user_stats.total_xp + $3,
			last_study_date = CURRENT_DATE,
			updated_at = NOW()`
	
	if _, err := tx.ExecContext(ctx, queryStats, userID, minutes, xpEarned); err != nil {
		return
	}

	// 2. Log Granular Activity (For graphs)
	// This matches your old LogActivity logic but batched
	queryLog := `
		INSERT INTO activity_logs (user_id, book_id, date, minutes_spent, updated_at)
		VALUES ($1, $2, CURRENT_DATE, $3, NOW())
		ON CONFLICT (user_id, book_id, date)
		DO UPDATE SET 
			minutes_spent = activity_logs.minutes_spent + EXCLUDED.minutes_spent,
			updated_at = NOW()`
	
	if _, err := tx.ExecContext(ctx, queryLog, userID, bookID, minutes); err != nil {
		return
	}

	if err := tx.Commit(); err != nil {
		return
	}

	// 3. Reset the Redis Counter
	// We decrement by the amount we just saved.
	m.Cache.DecrBy(context.Background(), fmt.Sprintf(KeySessionTime, userID), minutes)
}

// updateStreakInDB handles the daily streak logic
func (m AnalyticsModel) updateStreakInDB(userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Logic: If last_study_date was yesterday, increment. Else, reset to 1.
	query := `
		INSERT INTO user_stats (user_id, current_streak, longest_streak, last_study_date, updated_at)
		VALUES ($1, 1, 1, CURRENT_DATE, NOW())
		ON CONFLICT (user_id) DO UPDATE SET 
			current_streak = CASE 
				WHEN user_stats.last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN user_stats.current_streak + 1
				WHEN user_stats.last_study_date = CURRENT_DATE THEN user_stats.current_streak
				ELSE 1 
			END,
			longest_streak = CASE 
				WHEN (user_stats.last_study_date = CURRENT_DATE - INTERVAL '1 day') AND (user_stats.current_streak + 1 > user_stats.longest_streak)
				THEN user_stats.current_streak + 1
				ELSE user_stats.longest_streak
			END,
			last_study_date = CURRENT_DATE,
			updated_at = NOW()`
	
	_, err := m.DB.ExecContext(ctx, query, userID)
	return err
}

// GetStudentStats - Upgraded to fetch from user_stats
func (m AnalyticsModel) GetStudentStats(userID string) (*StudentStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	stats := &StudentStats{}

	// 1. Fetch Aggregates & Gamification Data
	queryStats := `
		SELECT total_minutes_studied, current_streak, longest_streak, total_xp, current_level
		FROM user_stats WHERE user_id = $1`
	
	err := m.DB.QueryRowContext(ctx, queryStats, userID).Scan(
		&stats.TotalMinutes, 
		&stats.CurrentStreak, 
		&stats.LongestStreak, 
		&stats.TotalXP, 
		&stats.CurrentLevel,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	// If no rows, fields default to 0, which is fine.

	// 2. Calculate Level Progress (Logic: (CurrentXP - LevelStart) / (LevelEnd - LevelStart))
	// Simple lookup for V1:
	var xpRequired int
	_ = m.DB.QueryRowContext(ctx, "SELECT xp_required FROM levels WHERE level = $1", stats.CurrentLevel + 1).Scan(&xpRequired)
	if xpRequired > 0 {
		stats.NextLevelProgress = (stats.TotalXP * 100) / xpRequired
	} else {
		stats.NextLevelProgress = 100 // Max level
	}

	// 3. Activity Chart (Keep existing logic)
	// ... [Copy your existing queryChart logic here] ...
    // Note: I'm omitting it here for brevity, but DO NOT DELETE IT from your file.
    // Use the exact same queryChart code you already have.

	// 4. Last Book (Keep existing logic)
	// ... [Copy your existing queryLastBook logic here] ...

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
	// 1. Try Cache
	var data AdminDashboardData
	cacheKey := "admin:dashboard"
	if m.Cache.Get(context.Background(), cacheKey, &data) {
		return &data, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	data = AdminDashboardData{
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

	// 2. Set Cache
	m.Cache.Set(context.Background(), cacheKey, &data, 5*time.Minute)

	return &data, nil
}