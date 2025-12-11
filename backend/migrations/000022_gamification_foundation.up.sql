-- 1. USER STATS (The Permanent Record)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    
    total_xp INT DEFAULT 0,
    current_level INT DEFAULT 1,
    
    total_minutes_studied INT DEFAULT 0,
    
    last_study_date DATE DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACTIVITY LOG (Granular History - Optional but good for auditing)
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id),
    
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INT DEFAULT 0,
    xp_earned INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LEVELS CONFIG (Static Data)
CREATE TABLE IF NOT EXISTS levels (
    level INT PRIMARY KEY,
    xp_required INT NOT NULL,
    title TEXT NOT NULL
);

-- Seed Initial Levels
INSERT INTO levels (level, xp_required, title) VALUES 
(1, 0, 'Seeker (Murid)'),
(2, 500, 'Reader (Qari)'),
(3, 1500, 'Scribe (Katib)'),
(4, 3000, 'Preserver (Hafiz)'),
(5, 5000, 'Scholar (Alim)')
ON CONFLICT DO NOTHING;