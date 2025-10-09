-- +goose Up
-- +goose StatementBegin
ALTER TABLE problems
ADD CONSTRAINT uk_title UNIQUE (title);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE problems
DROP CONSTRAINT uk_title;
-- +goose StatementEnd
