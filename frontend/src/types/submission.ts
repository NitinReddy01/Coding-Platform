export type SubmissionType = "run" | "submit";

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
