-- Note: The 'resource_type' ENUM was already created in migration 000001

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- We use the ENUM we defined earlier
    type resource_type NOT NULL,
    
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    
    -- Optional: Start/End times for YouTube deep linking
    media_start_seconds INT DEFAULT 0,
    media_end_seconds INT,
    
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index so fetching resources for a book is fast
CREATE INDEX idx_resources_book ON resources(book_id);