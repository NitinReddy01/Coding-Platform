/**
 * Type definitions for the problem creation form
 *
 * @module types/problem-form
 */

import type { Difficulty, RequestStatus } from './problem';

/**
 * Form test case with additional UI state
 */
export interface FormTestCase {
  /** Test case input */
  input: string;
  /** Expected output */
  expected_output: string;
  /** Whether this is a sample test case (visible to users) */
  is_sample: boolean;
  /** Order/position of the test case */
  order_index: number;
  /** Optional explanation for sample test cases */
  explanation?: string;
  /** Temporary ID for UI (not sent to server) */
  tempId?: string;
}

/**
 * Complete problem form data
 *
 * Note: author_id and status are not included - they are set server-side
 * based on the authenticated user and their role (admin auto-approves)
 */
export interface ProblemFormData {
  /** Problem title */
  title: string;
  /** Problem description (markdown or plain text) */
  description: string;
  /** Difficulty level */
  difficulty: Difficulty;
  /** Time limit in milliseconds */
  time_limit: number;
  /** Memory limit in MB */
  memory_limit: number;
  /** Optional constraints */
  constraints?: string;
  /** Test cases */
  test_cases: FormTestCase[];
  /** Tags (array of tag names) */
  tags: string[];
}

/**
 * Problem input format for API submission
 *
 * Note: author_id and status are not included - they are determined server-side
 * from the authenticated user's ID and role
 */
export interface ProblemInput {
  title: string;
  description: string;
  difficulty: Difficulty;
  time_limit: number;
  memory_limit: number;
  constraints?: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
    is_sample: boolean;
    order_index: number;
    explanation?: string;
  }>;
  tags: string[];
}

/**
 * Form validation errors
 */
export interface FormErrors {
  title?: string;
  description?: string;
  difficulty?: string;
  time_limit?: string;
  memory_limit?: string;
  constraints?: string;
  test_cases?: string;
  tags?: string;
  /** Test case specific errors (indexed by test case index or tempId) */
  testCaseErrors?: Record<string, {
    input?: string;
    expected_output?: string;
    order_index?: string;
  }>;
}

/**
 * Form step/tab in the multi-step form
 */
export type FormStep = 'details' | 'test-cases' | 'tags' | 'preview';

/**
 * Form state management
 */
export interface ProblemFormState {
  /** Current form data */
  data: ProblemFormData;
  /** Current step in the form */
  currentStep: FormStep;
  /** Validation errors */
  errors: FormErrors;
  /** Whether the form is submitting */
  isSubmitting: boolean;
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Uploaded files for bulk test case upload */
  uploadedFiles: File[];
}

/**
 * Form actions
 */
export interface ProblemFormActions {
  /** Update form field */
  updateField: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
  /** Add a test case */
  addTestCase: (testCase: FormTestCase) => void;
  /** Update a test case */
  updateTestCase: (index: number, testCase: Partial<FormTestCase>) => void;
  /** Remove a test case */
  removeTestCase: (index: number) => void;
  /** Add a tag */
  addTag: (tag: string) => void;
  /** Remove a tag */
  removeTag: (tag: string) => void;
  /** Set validation errors */
  setErrors: (errors: FormErrors) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Go to specific step */
  goToStep: (step: FormStep) => void;
  /** Validate current step */
  validateStep: (step: FormStep) => boolean;
  /** Validate entire form */
  validateForm: () => boolean;
  /** Submit the form */
  submitForm: () => Promise<void>;
  /** Reset form */
  resetForm: () => void;
  /** Load from localStorage */
  loadDraft: () => void;
  /** Save to localStorage */
  saveDraft: () => void;
}

/**
 * Initial/default form values
 *
 * Note: author_id and status are not included - they are set by the backend
 */
export const INITIAL_FORM_DATA: ProblemFormData = {
  title: '',
  description: '',
  difficulty: 'easy',
  time_limit: 2000, // 2 seconds default
  memory_limit: 256, // 256 MB default
  constraints: '',
  test_cases: [],
  tags: [],
};

/**
 * Form field limits
 */
export const FORM_LIMITS = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 10000,
  CONSTRAINTS_MAX_LENGTH: 2000,
  TIME_LIMIT_MIN: 100,
  TIME_LIMIT_MAX: 10000,
  MEMORY_LIMIT_MIN: 16,
  MEMORY_LIMIT_MAX: 512,
  MIN_TEST_CASES: 1,
  MAX_TEST_CASES: 100,
  MIN_TAGS: 0,
  MAX_TAGS: 10,
  TAG_MIN_LENGTH: 2,
  TAG_MAX_LENGTH: 30,
} as const;
