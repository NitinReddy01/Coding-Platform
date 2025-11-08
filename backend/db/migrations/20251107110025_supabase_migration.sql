-- +goose Up
-- Drop authentication table (Supabase handles auth now)
DROP TABLE IF EXISTS authentication CASCADE;

-- Drop refresh_tokens table (Supabase handles tokens now)
DROP TABLE IF EXISTS refresh_tokens CASCADE;

-- Remove verification token columns (Supabase handles email verification)
ALTER TABLE users DROP COLUMN IF EXISTS verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS verification_token_expires_at;

-- Note: users.id will now store Supabase user UUID directly
-- No need for separate supabase_user_id column

-- +goose Down
-- Recreate verification token columns
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMP;

-- Recreate refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recreate authentication table
CREATE TABLE IF NOT EXISTS authentication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    password_hash TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, provider)
);
