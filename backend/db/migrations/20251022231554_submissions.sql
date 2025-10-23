-- +goose Up
-- +goose StatementBegin
CREATE TYPE submission_status AS ENUM ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error');
CREATE TYPE submission_type as ENUM ('run', 'submit')

CREATE TABLE IF NOT EXISTS submissions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    type submission_type NOT NULL,
    runtime_ms integer,
    memory_used_mb DECIMAL(10,2),
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER NOT NULL,
    error_message TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_submissions_user_problem_status ON submissions(user_id, problem_id, status);
CREATE INDEX idx_submissions_status_submitted ON submissions(status, submitted_at);
CREATE INDEX idx_submissions_user_submitted ON submissions(user_id, submitted_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_submissions_user_problem_status, idx_submissions_status_submitted, idx_submissions_user_submitted;

DROP TABLE IF EXISTS submissions;
-- +goose StatementEnd
