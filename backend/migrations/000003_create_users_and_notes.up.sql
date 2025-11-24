-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SEED THE MOCK USER
-- We force this specific ID because we hardcoded it in your Go backend (notes.go)
INSERT INTO users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'guest@iqraa.com', 'Guest Student')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Notes Table (Now safe to reference users)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Links
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Data
    title TEXT,
    content JSONB, -- Stores the Tiptap Rich Text
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Performance Indexes
CREATE INDEX idx_notes_book ON notes(book_id);
CREATE INDEX idx_notes_user ON notes(user_id);