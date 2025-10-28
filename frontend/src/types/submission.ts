export type SubmissionType = "run" | "submit";

/**
 * Status values for submission execution
 * Matches backend submission_status enum
 */
export type SubmissionStatus =
  | "pending"           // Waiting in queue
  | "running"           // Currently executing
  | "accepted"          // All tests passed
  | "wrong_answer"      // Some tests failed
  | "time_limit_exceeded"    // Timeout
  | "memory_limit_exceeded"  // Out of memory
  | "runtime_error"     // Runtime error
  | "compilation_error"; // Compilation failed

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
  expected_output: string;
  error?: string;
  execution_time?: number;
  memory_used?: number;
}

/**
 * Response from submission API
 *
 * Contains submission ID for tracking and timestamp.
 * Actual results are processed asynchronously via queue.
 */
export interface SubmissionResponse {
  /** Unique identifier for the submission */
  submission_id: string;
  /** ISO 8601 timestamp of when submission was created */
  submitted_at: string;
}

/**
 * Response from polling endpoint
 *
 * Lightweight response for checking submission status.
 * Used for real-time polling while submission is being processed.
 */
export interface SubmissionStatusResponse {
  /** Current status of the submission */
  status: SubmissionStatus;
  /** Maximum runtime in milliseconds (only when complete) */
  runtime_ms?: number;
  /** Maximum memory used in MB (only when complete) */
  memory_used_mb?: number;
  /** Number of test cases passed (only when complete) */
  test_cases_passed?: number;
  /** Total number of test cases (only when complete) */
  test_cases_total?: number;
  /** Error message if any (only on error statuses) */
  error_message?: string;
  /** Results for sample test cases (only when complete, for debugging) */
  sample_test_results?: ExecutionResult[];
}

/**
 * Response from latest submission endpoint
 *
 * Contains the user's most recent submission for a problem.
 * Used to populate the code editor with previous work.
 */
export interface LatestSubmissionResponse {
  /** The code from the latest submission */
  code: string;
  /** Programming language used */
  language: string;
  /** ISO 8601 timestamp of when submission was created */
  submitted_at: string;
}
