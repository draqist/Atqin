package data

import (
	"database/sql"
	"errors"
)

// Define a custom error for when records aren't found
var (
	ErrRecordNotFound = errors.New("record not found")
)

// Models struct is a single container for all your database models
type Models struct {
	Books BookModel
	Nodes NodeModel
	Resources ResourceModel
	Notes NoteModel
	Bookmarks BookmarkModel
	Users UserModel
	Roadmaps RoadmapModel
	Analytics AnalyticsModel
	Social SocialModel
	Waitlist WaitlistModel
	Notifications NotificationModel
	// We will add Nodes, Users, Resources here later
}

// NewModels returns a Models struct containing the initialized services
func NewModels(db *sql.DB) Models {
	return Models{
		Books: BookModel{DB: db},
		Nodes: NodeModel{DB: db},
		Resources: ResourceModel{DB: db},
		Notes: NoteModel{DB: db},
		Bookmarks: BookmarkModel{DB: db},
		Users: UserModel{DB: db},
		Roadmaps: RoadmapModel{DB: db},
		Analytics: AnalyticsModel{DB: db},
		Social: SocialModel{DB: db},
		Waitlist: WaitlistModel{DB: db},
		Notifications: NotificationModel{DB: db},
	}
}