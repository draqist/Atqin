CREATE TABLE IF NOT EXISTS user_book_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    current_page INT NOT NULL DEFAULT 1,
    total_pages INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
);

CREATE INDEX idx_user_book_progress_user ON user_book_progress(user_id);
CREATE INDEX idx_user_book_progress_book ON user_book_progress(book_id);
