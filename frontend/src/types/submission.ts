import type { TestCase } from "./problem";

export interface Submission {
  code: string;
  language: string;
  problem_id: string;
  test_cases: TestCase[];
  /** Maximum execution time allowed in milliseconds */
  time_limit: number;
  /** Maximum memory allowed in megabytes */
  memory_limit: number;
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
 * Complete response from code execution
 *
 * Aggregates all test case results with summary statistics.
 */
export interface SubmissionResponse {
  /** Results for each test case */
  results: ExecutionResult[];
  /** Total number of test cases */
  total_tests: number;
  /** Number of test cases that passed */
  passed_tests: number;
  /** Number of test cases that failed */
  failed_tests: number;
  /** Total execution time across all test cases in milliseconds */
  total_time: number;
}
