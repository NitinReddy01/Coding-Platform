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
  /** Index of the test case (0-based) */
  test_case_index: number;
  /** Whether the output matched the expected output */
  passed: boolean;
  /** Input provided to the code */
  input: string;
  /** Actual output produced by the code */
  output: string;
  /** Expected output for comparison */
  expected_output: string;
  /** Error message if execution failed (runtime error, compile error, etc.) */
  error?: string;
  /** Time taken to execute in milliseconds */
  execution_time?: number;
  /** Memory consumed in megabytes */
  memory_used?: number;
  /** Whether execution exceeded the time limit */
  is_timeout?: boolean;
  /** Whether execution ran out of memory */
  is_oom?: boolean;
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
