CREATE TABLE IF NOT EXISTS waitlist (
    id bigserial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);
