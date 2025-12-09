-- Revert the check constraint to exclude 'super_admin'
-- CAUTION: Users with 'super_admin' role will fail this constraint check if not handled.
-- Ideally we would migrate them back to 'admin' first.

UPDATE users SET role = 'admin' WHERE role = 'super_admin';

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_role;
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('student', 'admin', 'moderator'));
