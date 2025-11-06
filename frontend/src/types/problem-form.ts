import type { Difficulty } from './problem';

export interface FormTestCase {
  input: string;
  expected_output: string;
  is_sample: boolean;
  order_index: number;
  explanation?: string;
  tempId?: string;
}

export interface ProblemFormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  input_description: string;
  output_description: string;
  time_limit: number;
  memory_limit: number;
  constraints?: string;
  validator_code?: string;
  validator_language: string;
  test_cases: FormTestCase[];
  tags: string[];
}

export interface ProblemInput {
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  difficulty: Difficulty;
  time_limit: number;
  memory_limit: number;
  constraints?: string;
  validator_code?: string;
  validator_language: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
    is_sample: boolean;
    order_index: number;
    explanation?: string;
  }>;
  tags: string[];
}

export interface FormErrors {
  title?: string;
  description?: string;
  input_description?: string;
  output_description?: string;
  difficulty?: string;
  time_limit?: string;
  memory_limit?: string;
  constraints?: string;
  validator_code?: string;
  validator_language?: string;
  test_cases?: string;
  tags?: string;
  testCaseErrors?: Record<string, {
    input?: string;
    expected_output?: string;
    order_index?: string;
  }>;
}

export type FormStep = 'details' | 'test-cases' | 'validator' | 'tags' | 'preview';

export interface ProblemFormState {
  data: ProblemFormData;
  currentStep: FormStep;
  errors: FormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
  uploadedFiles: File[];
}

export interface ProblemFormActions {
  updateField: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
  addTestCase: (testCase: FormTestCase) => void;
  updateTestCase: (index: number, testCase: Partial<FormTestCase>) => void;
  removeTestCase: (index: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setErrors: (errors: FormErrors) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: FormStep) => void;
  validateStep: (step: FormStep) => boolean;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  loadDraft: () => void;
  saveDraft: () => void;
}

export const INITIAL_FORM_DATA: ProblemFormData = {
  title: '',
  description: '',
  difficulty: 'easy',
  input_description: '',
  output_description: '',
  time_limit: 2000,
  memory_limit: 256,
  constraints: '',
  validator_code: undefined,
  validator_language: 'python',
  test_cases: [],
  tags: [],
};

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
