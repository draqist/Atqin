-- Ensure table exists (in case it was missing from migrations)
CREATE TABLE IF NOT EXISTS activity_logs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    minutes_spent INT DEFAULT 0,
    PRIMARY KEY (user_id, book_id, date)
);

-- Add updated_at if it doesn't exist
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
