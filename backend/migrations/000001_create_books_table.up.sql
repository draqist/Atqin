-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE node_type AS ENUM ('root', 'volume', 'chapter', 'section', 'bayt', 'paragraph');
CREATE TYPE resource_type AS ENUM ('pdf', 'youtube_video', 'audio', 'web_link');

-- 1. BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    original_author TEXT,
    description TEXT,
    cover_image_url TEXT,
    metadata JSONB DEFAULT '{}', 
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- 2. CONTENT NODES (The Tree Structure)
CREATE TABLE IF NOT EXISTS content_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES content_nodes(id) ON DELETE CASCADE,
    node_type node_type NOT NULL,
    content_text TEXT NOT NULL,
    sequence_index INT NOT NULL,
    audio_timestamp_start INT, 
    audio_timestamp_end INT,
    version INTEGER DEFAULT 1
);

-- Indexes for speed
CREATE INDEX idx_nodes_parent ON content_nodes(parent_id);
CREATE INDEX idx_nodes_book ON content_nodes(book_id);
CREATE INDEX idx_nodes_sequence ON content_nodes(book_id, sequence_index);