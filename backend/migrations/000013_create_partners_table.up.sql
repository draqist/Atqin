CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique relationship (order doesn't matter logic handled in app or via two rows? 
    -- Let's enforce user_id_1 < user_id_2 for uniqueness if we want single row, 
    -- but for simplicity, let's just ensure unique pair regardless of order)
    CONSTRAINT unique_partnership UNIQUE (user_id_1, user_id_2)
);

CREATE INDEX idx_partners_user_1 ON partners(user_id_1);
CREATE INDEX idx_partners_user_2 ON partners(user_id_2);
