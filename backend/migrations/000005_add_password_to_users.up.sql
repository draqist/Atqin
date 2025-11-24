ALTER TABLE users ADD COLUMN password_hash BYTEA NOT NULL DEFAULT '';
-- Note: We use BYTEA (Byte Array) because bcrypt outputs raw bytes. 
-- TEXT works too, but BYTEA is slightly more efficient for hashes.