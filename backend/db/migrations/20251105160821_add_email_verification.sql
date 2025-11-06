-- +goose Up
-- +goose StatementBegin

-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMPTZ;

-- Index for fast token lookups
CREATE INDEX idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;

-- Existing users are auto-verified (backward compatible)
UPDATE users SET email_verified = true WHERE created_at < NOW();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop index
DROP INDEX IF EXISTS idx_users_verification_token;

-- Remove columns
ALTER TABLE users DROP COLUMN IF EXISTS verification_token_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;

-- +goose StatementEnd
