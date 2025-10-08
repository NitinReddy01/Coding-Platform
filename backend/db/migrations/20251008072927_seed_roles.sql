-- +goose Up
-- +goose StatementBegin
INSERT INTO roles (name)
VALUES ('admin'),('user'),('author'),('guest')
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM roles;
-- +goose StatementEnd
