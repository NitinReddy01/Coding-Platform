-- +goose Up
-- +goose StatementBegin
ALTER TABLE submissions
ADD COLUMN sample_test_results JSONB;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE submissions
DROP COLUMN sample_test_results;
-- +goose StatementEnd
