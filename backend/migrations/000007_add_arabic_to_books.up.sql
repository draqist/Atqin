ALTER TABLE books 
ADD COLUMN title_ar TEXT,
ADD COLUMN author_ar TEXT;

-- Create an index for fast searching on these new columns
CREATE INDEX idx_books_title_ar ON books(title_ar);
CREATE INDEX idx_books_author_ar ON books(author_ar);
-- Create an index for English search (case-insensitive)
CREATE INDEX idx_books_title_en ON books USING gin (to_tsvector('english', title));