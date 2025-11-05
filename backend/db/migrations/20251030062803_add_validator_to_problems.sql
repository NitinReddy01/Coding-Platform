-- +goose Up
-- +goose StatementBegin
ALTER TABLE problems ADD COLUMN validator_code TEXT;
ALTER TABLE problems ADD COLUMN validator_language VARCHAR(50) DEFAULT 'python';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE problems DROP COLUMN validator_code;
ALTER TABLE problems DROP COLUMN validator_language;
-- +goose StatementEnd
