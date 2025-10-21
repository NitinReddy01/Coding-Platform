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
  id: string;
  title: string;
  description: string;
  input_description:string;
  output_description:string;
  difficulty: Difficulty;
  constraints?: string;
  /** Maximum execution time allowed in milliseconds */
  time_limit: number;
  /** Maximum memory allowed in MB */
  memory_limit: number;
  tags: Tag[];
  submissions: number;
  accepted: number;
  author_id: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
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