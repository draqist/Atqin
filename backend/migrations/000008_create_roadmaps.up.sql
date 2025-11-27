-- 1. The Tracks
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for URLs like /roadmaps/hanbali-fiqh
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. The Steps (Nodes)
CREATE TABLE IF NOT EXISTS roadmap_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE, -- Every step MUST link to a book
    
    sequence_index INT NOT NULL, -- 1, 2, 3 (Order of study)
    level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    description TEXT, -- Specific instructions for this step (e.g. "Focus on memorizing the definitions")
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Progress
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE IF NOT EXISTS user_roadmap_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    
    status progress_status DEFAULT 'not_started',
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, node_id)
);

-- Indexes for speed
CREATE INDEX idx_roadmap_nodes_roadmap ON roadmap_nodes(roadmap_id);
CREATE INDEX idx_roadmap_nodes_book ON roadmap_nodes(book_id);
CREATE INDEX idx_user_progress_user ON user_roadmap_progress(user_id);