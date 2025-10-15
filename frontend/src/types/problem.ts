/**
 * Problem difficulty levels
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Problem approval status in the review workflow
 */
export type RequestStatus = 'pending' | 'rejected' | 'approved' | 'requested_changes';

/**
 * Tag for categorizing problems (e.g., "Array", "Dynamic Programming")
 */
export interface Tag {
  /** Unique identifier for the tag */
  id: string;
  /** Display name of the tag */
  name: string;
}

/**
 * Represents a coding problem/challenge
 *
 * Contains all metadata, constraints, and test cases for a problem.
 * Problems go through an approval workflow before being published.
 */
export interface Problem {
  /** Unique identifier */
  id: string;
  /** Problem title shown to users */
  title: string;
  /** Detailed problem description (supports HTML formatting) */
  description: string;
  /** Difficulty level (easy, medium, hard) */
  difficulty: Difficulty;
  /** Optional constraints text (e.g., "1 <= n <= 10^5") */
  constraints?: string;
  /** Maximum execution time allowed in milliseconds */
  time_limit: number;
  /** Maximum memory allowed in megabytes */
  memory_limit: number;
  /** Associated tags for categorization */
  tags: Tag[];
  /** Total number of submission attempts */
  submissions: number;
  /** Number of accepted (correct) submissions */
  accepted: number;
  /** ID of the user who created this problem */
  author_id: string;
  /** Current status in the approval workflow */
  status: RequestStatus;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** Sample test cases shown to users for validation */
  sample_test_cases: TestCase[];
}

export type ProblemMode = 'contest' | 'edit' | 'practice'

/**
 * A single test case with input and expected output
 */
export interface TestCase {
  /** Input string to be provided to the solution */
  input: string;
  /** Expected output string from the solution */
  expected_output: string;
}

/**
 * Programming language configuration
 */
export interface Language {
  /** Language identifier (e.g., 'python', 'java', 'cpp') */
  code: string;
  /** Display name (e.g., 'Python 3.11', 'Java 17') */
  language: string;
  /** Monaco editor language ID for syntax highlighting */
  monaco_id: string;
  /** Default starter code template */
  default_code: string;
}