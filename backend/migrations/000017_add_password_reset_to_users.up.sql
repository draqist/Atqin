ALTER TABLE users ADD COLUMN password_reset_token_hash BYTEA;
ALTER TABLE users ADD COLUMN password_reset_expiry TIMESTAMPTZ;
