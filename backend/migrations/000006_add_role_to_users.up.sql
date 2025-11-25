-- Add role column, default everyone to 'student'
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student';

-- Optional: Add a check constraint to ensure valid roles
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('student', 'admin', 'moderator'));