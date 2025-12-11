package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/draqist/iqraa/backend/internal/cache"
)

// Roadmap represents a structured learning path.
type Roadmap struct {
	ID            string         `json:"id"`
	Title         string         `json:"title"`
	Slug          string         `json:"slug"`
	Description   string         `json:"description"`
	CoverImageURL string         `json:"cover_image_url"`
	Nodes         []*RoadmapNode `json:"nodes,omitempty"`
	NodesCount    int            `json:"nodes_count"`
	CreatedAt     time.Time      `json:"created_at"`
	IsPublic      bool           `json:"is_public"`
}

// RoadmapNode represents a single step or book within a roadmap.
type RoadmapNode struct {
	ID            string `json:"id"`
	RoadmapID     string `json:"roadmap_id"`
	BookID        string `json:"book_id"`
	BookTitle     string `json:"book_title"`
	BookAuthor    string `json:"book_author"`
	BookCover     string `json:"book_cover"`
	SequenceIndex int    `json:"sequence_index"`
	Level         string `json:"level"`
	Description   string `json:"description"`
	UserStatus    string `json:"user_status"`
}

// RoadmapModel wraps the database connection pool for Roadmap-related operations.
type RoadmapModel struct {
	DB    *sql.DB
	Cache *cache.Service
}

// GetAll fetches all available roadmaps.
// If includeDrafts is true, it returns all roadmaps (for admins).
// Otherwise, it returns only public roadmaps (for students).
func (m RoadmapModel) GetAll(includeDrafts bool) ([]*Roadmap, error) {
	// 1. Try Cache
	var roadmaps []*Roadmap
	cacheKey := fmt.Sprintf("roadmaps:list:%t", includeDrafts)
	if m.Cache.Get(context.Background(), cacheKey, &roadmaps) {
		return roadmaps, nil
	}

	var query string

	if includeDrafts {
		query = `SELECT id, title, slug, COALESCE(description, ''), COALESCE(cover_image_url, ''), is_public, created_at 
                 FROM roadmaps 
                 ORDER BY title ASC`
	} else {
		query = `SELECT id, title, slug, COALESCE(description, ''), COALESCE(cover_image_url, ''), is_public, created_at 
                 FROM roadmaps 
                 WHERE is_public = true 
                 ORDER BY title ASC`
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r Roadmap
		err := rows.Scan(
			&r.ID,
			&r.Title,
			&r.Slug,
			&r.Description,
			&r.CoverImageURL,
			&r.IsPublic,
			&r.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		roadmaps = append(roadmaps, &r)
	}

	var queryNodes string
	if includeDrafts {
		queryNodes = `
			SELECT 
				rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
				b.title, b.original_author, b.cover_image_url
			FROM roadmap_nodes rn
			JOIN books b ON rn.book_id = b.id
			JOIN roadmaps r ON rn.roadmap_id = r.id
			ORDER BY rn.roadmap_id, rn.sequence_index ASC`
	} else {
		queryNodes = `
			SELECT 
				rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
				b.title, b.original_author, b.cover_image_url
			FROM roadmap_nodes rn
			JOIN books b ON rn.book_id = b.id
			JOIN roadmaps r ON rn.roadmap_id = r.id
			WHERE r.is_public = true
			ORDER BY rn.roadmap_id, rn.sequence_index ASC`
	}

	rowsNodes, err := m.DB.QueryContext(ctx, queryNodes)
	if err != nil {
		return nil, err
	}
	defer rowsNodes.Close()

	nodesMap := make(map[string][]*RoadmapNode)

	for rowsNodes.Next() {
		var n RoadmapNode
		var desc sql.NullString

		n.UserStatus = "not_started"

		err := rowsNodes.Scan(
			&n.ID, &n.RoadmapID, &n.BookID, &n.SequenceIndex, &n.Level, &desc,
			&n.BookTitle, &n.BookAuthor, &n.BookCover,
		)
		if err != nil {
			return nil, err
		}
		if desc.Valid {
			n.Description = desc.String
		}

		nodesMap[n.RoadmapID] = append(nodesMap[n.RoadmapID], &n)
	}

	for _, r := range roadmaps {
		if nodes, ok := nodesMap[r.ID]; ok {
			r.Nodes = nodes
			r.NodesCount = len(nodes)
		} else {
			r.Nodes = []*RoadmapNode{}
			r.NodesCount = 0
		}
	}

	// 2. Set Cache
	// Note: We use a shorter TTL for lists as they might change more often
	// For now, consistent with others: 1 Hour for public, maybe less for drafts? Stick to 1h.
	m.Cache.Set(context.Background(), cacheKey, roadmaps, 1*time.Hour)

	return roadmaps, nil
}

// GetBySlug fetches a single roadmap and all its nodes.
// If userID is provided, it also fetches the user's progress for each node.
func (m RoadmapModel) GetBySlug(slug string, userID string) (*Roadmap, error) {
	// 1. Try Cache (Only for public view without userID for now, or include userID in key)
	// We include userID in key to cache personalized versions too if needed,
	// BUT for simplicity and max hit rate, usually we cache the generic structure
	// and fetch progress separately. Given the function signature, let's cache
	// based on both inputs.
	var r Roadmap
	cacheKey := fmt.Sprintf("roadmap:slug:%s:user:%s", slug, userID)
	if m.Cache.Get(context.Background(), cacheKey, &r) {
		return &r, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	queryRoadmap := `
		SELECT id, title, slug, COALESCE(description, ''), COALESCE(cover_image_url, ''), is_public, created_at 
		FROM roadmaps 
		WHERE slug = $1`

	err := m.DB.QueryRowContext(ctx, queryRoadmap, slug).Scan(
		&r.ID, &r.Title, &r.Slug, &r.Description, &r.CoverImageURL, &r.IsPublic, &r.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	queryNodes := `
		SELECT 
			rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
			b.title, COALESCE(b.original_author, ''), COALESCE(b.cover_image_url, ''),
			COALESCE(up.status, 'not_started') as user_status
		FROM roadmap_nodes rn
		JOIN books b ON rn.book_id = b.id
		LEFT JOIN user_roadmap_progress up ON rn.id = up.node_id AND up.user_id = $1
		WHERE rn.roadmap_id = $2
		ORDER BY rn.sequence_index ASC`

	var userIDParam interface{} = userID
	if userID == "" {
		userIDParam = nil
	}

	rows, err := m.DB.QueryContext(ctx, queryNodes, userIDParam, r.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []*RoadmapNode
	for rows.Next() {
		var n RoadmapNode
		var desc sql.NullString

		err := rows.Scan(
			&n.ID, &n.RoadmapID, &n.BookID, &n.SequenceIndex, &n.Level, &desc,
			&n.BookTitle, &n.BookAuthor, &n.BookCover,
			&n.UserStatus,
		)
		if err != nil {
			return nil, err
		}
		if desc.Valid {
			n.Description = desc.String
		}
		nodes = append(nodes, &n)
	}

	r.Nodes = nodes

	// 2. Set Cache (1 Hour)
	m.Cache.Set(context.Background(), cacheKey, &r, 1*time.Hour)

	return &r, nil
}

// UpdateProgress updates the status of a specific node for a user.
func (m RoadmapModel) UpdateProgress(userID, nodeID, status string) error {
	query := `
		INSERT INTO user_roadmap_progress (user_id, node_id, status, last_updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, node_id) 
		DO UPDATE SET status = $3, last_updated_at = NOW()`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, nodeID, status)
	return err
}

// Insert creates a new roadmap.
func (m RoadmapModel) Insert(roadmap *Roadmap) error {
	query := `
		INSERT INTO roadmaps (title, slug, description, cover_image_url, is_public)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`

	args := []any{
		roadmap.Title,
		roadmap.Slug,
		roadmap.Description,
		roadmap.CoverImageURL,
		roadmap.IsPublic,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&roadmap.ID, &roadmap.CreatedAt)
	if err != nil {
		return err
	}

	// Invalidate lists
	return m.Cache.Delete(context.Background(), "roadmaps:list:*")
}

// Update modifies an existing roadmap's metadata.
func (m RoadmapModel) Update(r *Roadmap) error {
	query := `
		UPDATE roadmaps 
		SET title = $1, slug = $2, description = $3, cover_image_url = $4, is_public = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at`

	args := []any{r.Title, r.Slug, r.Description, r.CoverImageURL, r.IsPublic, r.ID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&r.CreatedAt) // Using CreatedAt to store UpdatedAt for struct update (minor detail)
	if err != nil {
		return err
	}

	// Invalidate specific roadmap (slug could have changed, tricky, let's invalidate by pattern)
	// Ideally we know the old slug, but here we don't.
	// We can invalidate the specific user keys for this roadmap? Key structure is `roadmap:slug:{slug}:user:{userID}`
	// Since we don't know the exact keys, we might need a `roadmap:id:{id}` key map or just invalidate all roadmap keys for now?
	// Or just invalidate generic keys if we can.
	// For now, let's assume `roadmap:slug:*` is what we want to nuke if slug changes.
	// Even if slug doesn't change, content might.
	
	// WARNING: scan of keys is slow. `Delete` supports patterns in our Helper?
	// Helper defines Delete(ctx, pattern) which calls Keys(pattern) then Del.
	// So we can do:
	m.Cache.Delete(context.Background(), "roadmap:slug:*") // Broad but safe
	return m.Cache.Delete(context.Background(), "roadmaps:list:*")
}

// Delete removes a roadmap and all its associated nodes.
func (m RoadmapModel) Delete(id string) error {
	query := `DELETE FROM roadmaps WHERE id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.DB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	// Invalidate everything for roadmaps
	m.Cache.Delete(context.Background(), "roadmap:slug:*")
	return m.Cache.Delete(context.Background(), "roadmaps:list:*")
}

// InsertNode adds a new step (book) to a roadmap.
func (m RoadmapModel) InsertNode(n *RoadmapNode) error {
	query := `
		INSERT INTO roadmap_nodes (roadmap_id, book_id, sequence_index, level, description)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	args := []any{n.RoadmapID, n.BookID, n.SequenceIndex, n.Level, n.Description}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&n.ID)
}

// UpdateNode modifies an existing roadmap step.
func (m RoadmapModel) UpdateNode(n *RoadmapNode) error {
	query := `
		UPDATE roadmap_nodes
		SET book_id = $1, sequence_index = $2, level = $3, description = $4
		WHERE id = $5`

	args := []any{n.BookID, n.SequenceIndex, n.Level, n.Description, n.ID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, args...)
	return err
}

// DeleteNode removes a step from a roadmap.
func (m RoadmapModel) DeleteNode(id string) error {
	query := `DELETE FROM roadmap_nodes WHERE id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.DB.ExecContext(ctx, query, id)
	return err
}

// GetByID fetches a roadmap by its ID.
// This is primarily used for admin operations where the slug might change.
func (m RoadmapModel) GetByID(id string) (*Roadmap, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var r Roadmap
	queryRoadmap := `
		SELECT id, title, slug, COALESCE(description, ''), COALESCE(cover_image_url, ''), is_public, created_at 
		FROM roadmaps 
		WHERE id = $1`

	err := m.DB.QueryRowContext(ctx, queryRoadmap, id).Scan(
		&r.ID, &r.Title, &r.Slug, &r.Description, &r.CoverImageURL, &r.IsPublic, &r.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	queryNodes := `
		SELECT 
			rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
			b.title, COALESCE(b.original_author, ''), COALESCE(b.cover_image_url, ''),
			'not_started' as user_status
		FROM roadmap_nodes rn
		JOIN books b ON rn.book_id = b.id
		WHERE rn.roadmap_id = $1
		ORDER BY rn.sequence_index ASC`

	rows, err := m.DB.QueryContext(ctx, queryNodes, r.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []*RoadmapNode
	for rows.Next() {
		var n RoadmapNode
		var desc sql.NullString

		err := rows.Scan(
			&n.ID, &n.RoadmapID, &n.BookID, &n.SequenceIndex, &n.Level, &desc,
			&n.BookTitle, &n.BookAuthor, &n.BookCover,
			&n.UserStatus,
		)
		if err != nil {
			return nil, err
		}
		if desc.Valid {
			n.Description = desc.String
		}
		nodes = append(nodes, &n)
	}

	r.Nodes = nodes
	return &r, nil
}

// BatchUpdateNodes updates the sequence and level for multiple nodes in a single transaction.
func (m RoadmapModel) BatchUpdateNodes(updates []struct {
	NodeID        string `json:"node_id"`
	SequenceIndex int    `json:"sequence_index"`
	Level         string `json:"level"`
}) error {
	tx, err := m.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE roadmap_nodes SET sequence_index = $1, level = $2 WHERE id = $3`

	for _, u := range updates {
		_, err := tx.Exec(query, u.SequenceIndex, u.Level, u.NodeID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetNodeBookID retrieves the book ID associated with a given roadmap node.
func (m RoadmapModel) GetNodeBookID(nodeID string) (string, error) {
	query := `SELECT book_id FROM roadmap_nodes WHERE id = $1`

	var bookID string
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, nodeID).Scan(&bookID)
	if err != nil {
		return "", err
	}
	return bookID, nil
}