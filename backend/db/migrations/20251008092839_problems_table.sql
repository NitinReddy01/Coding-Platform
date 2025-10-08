-- +goose Up
-- +goose StatementBegin
CREATE TYPE difficulty_level AS ENUM ('easy','medium','hard');
CREATE TYPE request_status AS ENUM ('pending','rejected','approved','requested_changes');

CREATE TABLE IF NOT EXISTS problems(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    difficulty difficulty_level,
    author_id uuid NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    reviewed_by uuid,
    reviewed_at timestamptz,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),


    time_limit integer NOT NULL DEFAULT 1000, --- ms
    memory_limit integer NOT NULL DEFAULT 256, -- mb
    constraints text,

    submissions integer DEFAULT 0,
    accepted integer DEFAULT 0,

    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text
);

CREATE TABLE IF NOT EXISTS problem_tags(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    CONSTRAINT fk_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT uk_problem_tag UNIQUE (tag_id,problem_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS problem_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS problems;
DROP TYPE IF EXISTS difficulty_level;
DROP TYPE IF EXISTS request_status;
-- +goose StatementEnd
