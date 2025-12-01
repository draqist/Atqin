package data

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Roadmap struct {
	ID            string         `json:"id"`
	Title         string         `json:"title"`
	Slug          string         `json:"slug"`
	Description   string         `json:"description"`
	CoverImageURL string         `json:"cover_image_url"`
	Nodes         []*RoadmapNode `json:"nodes,omitempty"` // Nested nodes for the tree view
	NodesCount    int            `json:"nodes_count"`     // Count of nodes
	CreatedAt     time.Time      `json:"created_at"`
	IsPublic      bool           `json:"is_public"`
}

type RoadmapNode struct {
	ID            string `json:"id"`
	RoadmapID     string `json:"roadmap_id"`
	BookID        string `json:"book_id"`
	BookTitle     string `json:"book_title"`        // Joined from books table
	BookAuthor    string `json:"book_author"`       // Joined from books table
	BookCover     string `json:"book_cover"`        // Joined from books table
	SequenceIndex int    `json:"sequence_index"`
	Level         string `json:"level"`
	Description   string `json:"description"`
	UserStatus    string `json:"user_status"`       // 'completed', 'in_progress', etc.
}

type RoadmapModel struct {
	DB *sql.DB
}



// GetAll fetches all available roadmaps (just the summary)
func (m RoadmapModel) GetAll(includeDrafts bool) ([]*Roadmap, error) {
    var query string
    
    if includeDrafts {
        // Admin Query: No WHERE clause for is_public
        query = `SELECT id, title, slug, description, cover_image_url, is_public, created_at 
                 FROM roadmaps 
                 ORDER BY title ASC`
    } else {
        // Student Query: Strict filtering
        query = `SELECT id, title, slug, description, cover_image_url, is_public, created_at 
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

    var roadmaps []*Roadmap
    for rows.Next() {
        var r Roadmap
        // FIX 3: Added &r.IsPublic to Scan
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
    	// 2. Fetch Nodes for all these roadmaps
	// We use the same filtering logic (is_public) to get relevant nodes
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

	// Map roadmapID -> List of Nodes
	nodesMap := make(map[string][]*RoadmapNode)

	for rowsNodes.Next() {
		var n RoadmapNode
		var desc sql.NullString
		
		// We don't need user status for the list view, so we skip it or set default
		n.UserStatus = "not_started" 

		err := rowsNodes.Scan(
			&n.ID, &n.RoadmapID, &n.BookID, &n.SequenceIndex, &n.Level, &desc,
			&n.BookTitle, &n.BookAuthor, &n.BookCover,
		)
		if err != nil {
			return nil, err
		}
		if desc.Valid { n.Description = desc.String }
		
		nodesMap[n.RoadmapID] = append(nodesMap[n.RoadmapID], &n)
	}

	// 3. Attach nodes to roadmaps
	for _, r := range roadmaps {
		if nodes, ok := nodesMap[r.ID]; ok {
			r.Nodes = nodes
			r.NodesCount = len(nodes)
		} else {
			r.Nodes = []*RoadmapNode{}
			r.NodesCount = 0
		}
	}

	return roadmaps, nil
}

// GetBySlug fetches a single roadmap AND all its nodes (with user progress if userID is provided)
func (m RoadmapModel) GetBySlug(slug string, userID string) (*Roadmap, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// 1. Fetch Roadmap Metadata
	var r Roadmap
	queryRoadmap := `SELECT id, title, slug, description, cover_image_url, created_at FROM roadmaps WHERE slug = $1`
	
	err := m.DB.QueryRowContext(ctx, queryRoadmap, slug).Scan(
		&r.ID, &r.Title, &r.Slug, &r.Description, &r.CoverImageURL, &r.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	// 2. Fetch Nodes + Linked Book Data + User Progress
	// This is a complex join:
	// RoadmapNodes -> Books (to get title/image) -> UserProgress (LEFT JOIN to see if user did it)
	queryNodes := `
		SELECT 
			rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
			b.title, b.original_author, b.cover_image_url,
			COALESCE(up.status, 'not_started') as user_status
		FROM roadmap_nodes rn
		JOIN books b ON rn.book_id = b.id
		LEFT JOIN user_roadmap_progress up ON rn.id = up.node_id AND up.user_id = $1
		WHERE rn.roadmap_id = $2
		ORDER BY rn.sequence_index ASC`

	// If userID is empty (guest), $1 will match nothing, so COALESCE returns 'not_started' (Safe)
	
	rows, err := m.DB.QueryContext(ctx, queryNodes, userID, r.ID)
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
		if desc.Valid { n.Description = desc.String }
		nodes = append(nodes, &n)
	}

	r.Nodes = nodes
	return &r, nil
}

// UpdateProgress allows a user to mark a node as complete
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

// Insert creates a new roadmap container
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

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&roadmap.ID, &roadmap.CreatedAt)
}

// --- ROADMAP CONTAINER OPERATIONS ---

// Update modifies a roadmap's metadata
func (m RoadmapModel) Update(r *Roadmap) error {
	query := `
		UPDATE roadmaps 
		SET title = $1, slug = $2, description = $3, cover_image_url = $4, is_public = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at`

	args := []any{r.Title, r.Slug, r.Description, r.CoverImageURL, r.IsPublic, r.ID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&r.CreatedAt) // Scan updated_at essentially
}

// Delete removes a roadmap (and all its nodes via CASCADE)
func (m RoadmapModel) Delete(id string) error {
	query := `DELETE FROM roadmaps WHERE id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.DB.ExecContext(ctx, query, id)
	return err
}

// --- NODE OPERATIONS (The Steps) ---

// InsertNode adds a book to a roadmap
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

// UpdateNode modifies a step (e.g. changing level or order)
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

// DeleteNode removes a step
func (m RoadmapModel) DeleteNode(id string) error {
	query := `DELETE FROM roadmap_nodes WHERE id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.DB.ExecContext(ctx, query, id)
	return err
}

// GetByID fetches a roadmap by its UUID (Useful for Admin Edit)
func (m RoadmapModel) GetByID(id string) (*Roadmap, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// 1. Fetch Roadmap Metadata
	var r Roadmap
	queryRoadmap := `SELECT id, title, slug, description, cover_image_url, created_at FROM roadmaps WHERE id = $1`
	
	err := m.DB.QueryRowContext(ctx, queryRoadmap, id).Scan(
		&r.ID, &r.Title, &r.Slug, &r.Description, &r.CoverImageURL, &r.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	// 2. Fetch Nodes (Reuse logic - we don't need user progress for Admin edit, but we need the structure)
	// We simply pass a dummy/empty string for userID if we just want the raw tree
	queryNodes := `
		SELECT 
			rn.id, rn.roadmap_id, rn.book_id, rn.sequence_index, rn.level, rn.description,
			b.title, b.original_author, b.cover_image_url,
			'not_started' as user_status -- Admin doesn't need progress status
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
		if desc.Valid { n.Description = desc.String }
		nodes = append(nodes, &n)
	}

	r.Nodes = nodes
	return &r, nil
}

// BatchUpdateOrder updates the sequence and level for multiple nodes at once
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