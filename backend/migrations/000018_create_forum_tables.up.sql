CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL, -- 'book', 'roadmap', 'track'
    context_id TEXT NOT NULL, 
    title TEXT DEFAULT '',
    body TEXT NOT NULL,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussions_context ON discussions(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_discussions_last_reply ON discussions(last_reply_at DESC);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_discussion_id ON discussion_replies(discussion_id);
