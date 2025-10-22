-- +goose Up
-- +goose StatementBegin
ALTER TABLE problems ADD COLUMN input_description TEXT NOT NULL;
ALTER TABLE problems ADD COLUMN output_description TEXT NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE problems DROP COLUMN input_description;
ALTER TABLE problems DROP COLUMN output_description;
-- +goose StatementEnd
