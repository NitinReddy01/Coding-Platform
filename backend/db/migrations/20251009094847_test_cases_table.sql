-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS test_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL,

    -- Test case data
    input text NOT NULL,
    expected_output text NOT NULL,

    -- Visibility and ordering
    is_sample boolean NOT NULL DEFAULT false,  -- true = shown to users as examples, false = hidden for evaluation
    order_index integer NOT NULL DEFAULT 0,    -- display/execution order

    -- Optional explanation for sample test cases (shown in UI)
    explanation text,

    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_problem FOREIGN KEY (problem_id)
        REFERENCES problems(id) ON DELETE CASCADE,
    CONSTRAINT uk_problem_order UNIQUE (problem_id, order_index)
);

-- Indexes for fast retrieval
CREATE INDEX idx_test_cases_problem ON test_cases(problem_id);
CREATE INDEX idx_test_cases_sample ON test_cases(problem_id, is_sample);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_test_cases_sample;
DROP INDEX IF EXISTS idx_test_cases_problem;
DROP TABLE IF EXISTS test_cases;
-- +goose StatementEnd
