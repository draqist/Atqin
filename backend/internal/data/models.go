package data

import (
	"database/sql"
	"errors"
)

// Define a custom error for when records aren't found
var (
	ErrRecordNotFound = errors.New("record not found")
)

// Models holds all the database models for the application.
// It acts as a single container to inject data access layers into handlers.
type Models struct {
	Books         BookModel
	Nodes         NodeModel
	Resources     ResourceModel
	Notes         NoteModel
	Bookmarks     BookmarkModel
	Users         UserModel
	Roadmaps      RoadmapModel
	Analytics     AnalyticsModel
	Social        SocialModel
	Waitlist      WaitlistModel
	Notifications NotificationModel
	Features      FeatureRequestModel
	Community     CommunityModel
}

// NewModels initializes and returns a Models struct with all model instances
// connected to the provided database connection pool.
func NewModels(db *sql.DB) Models {
	return Models{
		Books:         BookModel{DB: db},
		Nodes:         NodeModel{DB: db},
		Resources:     ResourceModel{DB: db},
		Notes:         NoteModel{DB: db},
		Bookmarks:     BookmarkModel{DB: db},
		Users:         UserModel{DB: db},
		Roadmaps:      RoadmapModel{DB: db},
		Analytics:     AnalyticsModel{DB: db},
		Social:        SocialModel{DB: db},
		Waitlist:      WaitlistModel{DB: db},
		Notifications: NotificationModel{DB: db},
		Features:      FeatureRequestModel{DB: db},
		Community:     CommunityModel{DB: db},
	}
}