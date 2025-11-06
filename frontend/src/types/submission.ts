export type SubmissionType = "run" | "submit";

export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compilation_error";

export interface Submission {
  code: string;
  language: string;
  problem_id: string;
  type: SubmissionType;
}

export interface ExecutionResult {
  passed: boolean;
  input: string;
  actual_output: string;
  output: string; // Alias for actual_output, used by components
  expected_output: string;
  error?: string;
  execution_time?: number;
  memory_used?: number;
  is_timeout?: boolean;
  is_oom?: boolean; // Out of memory flag
}

export interface SubmissionResponse {
  submission_id: string;
  submitted_at: string;
}

export interface SubmissionStatusResponse {
  status: SubmissionStatus;
  runtime_ms?: number;
  memory_used_mb?: number;
  test_cases_passed?: number;
  test_cases_total?: number;
  error_message?: string;
  sample_test_results?: ExecutionResult[];
}

export interface LatestSubmissionResponse {
  code: string;
  language: string;
  submitted_at: string;
}
