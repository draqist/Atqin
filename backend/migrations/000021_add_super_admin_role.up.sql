-- Update the check constraint to include 'super_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_role;
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('student', 'admin', 'moderator', 'super_admin'));
