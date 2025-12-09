-- 1. Create the Status Enum
-- This defines the lifecycle of a book/resource
CREATE TYPE content_status AS ENUM ('draft', 'pending_review', 'published', 'rejected');

-- 2. Update Books Table
-- Default new items to 'draft' so they don't go live accidentally
ALTER TABLE books 
ADD COLUMN status content_status NOT NULL DEFAULT 'draft',
ADD COLUMN reviewer_id UUID REFERENCES users(id); -- Tracks who approved/rejected it

-- 3. Update Resources Table
ALTER TABLE resources 
ADD COLUMN status content_status NOT NULL DEFAULT 'draft',
ADD COLUMN reviewer_id UUID REFERENCES users(id);

-- 4. Data Migration (Backfill)
-- Convert existing live content to 'published' status so nothing breaks
UPDATE books 
SET status = 'published' 
WHERE is_public = true;

UPDATE resources 
SET status = 'published' 
WHERE is_official = true; 

-- 5. Indexes for filtering by status (Dashboard performance)
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_resources_status ON resources(status);