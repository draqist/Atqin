package data

import (
	"database/sql"
	"errors"

	"github.com/draqist/iqraa/backend/internal/cache"
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
func NewModels(db *sql.DB, cacheSvc *cache.Service) Models {
	return Models{
		Books:         BookModel{DB: db, Cache: cacheSvc},
		Nodes:         NodeModel{DB: db, Cache: cacheSvc},
		Resources:     ResourceModel{DB: db, Cache: cacheSvc},
		Notes:         NoteModel{DB: db, Cache: cacheSvc},
		Bookmarks:     BookmarkModel{DB: db, Cache: cacheSvc},
		Users:         UserModel{DB: db, Cache: cacheSvc},
		Roadmaps:      RoadmapModel{DB: db, Cache: cacheSvc},
		Analytics:     AnalyticsModel{DB: db, Cache: cacheSvc},
		Social:        SocialModel{DB: db, Cache: cacheSvc},
		Waitlist:      WaitlistModel{DB: db, Cache: cacheSvc},
		Notifications: NotificationModel{DB: db, Cache: cacheSvc},
		Features:      FeatureRequestModel{DB: db, Cache: cacheSvc},
		Community:     CommunityModel{DB: db, Cache: cacheSvc},
	}
}