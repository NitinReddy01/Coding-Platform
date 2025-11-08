-- +goose Up
-- +goose StatementBegin

-- ⚠️ DEPRECATED: This migration is no longer used after Supabase migration
--
-- Admin user seeding is now handled by the Go seeding script:
-- Run: go run cmd/seed/main.go
--
-- This empty migration is kept for historical purposes and to maintain
-- migration sequence integrity. It will do nothing when run.

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- No-op

-- +goose StatementEnd
