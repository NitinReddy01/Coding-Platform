/**
 * Custom hook for managing problem creation form state
 *
 * Handles form data, validation, step navigation, and local storage persistence.
 *
 * @module hooks/useProblemForm
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type {
  ProblemFormData,
  ProblemFormState,
  ProblemFormActions,
  FormErrors,
  FormStep,
  FormTestCase,
  ProblemInput,
} from '../types/problem-form';
import { INITIAL_FORM_DATA, FORM_LIMITS } from '../types/problem-form';
import { useAxiosPrivate } from './useAxiosPrivate';
import { createProblem } from '../api/problems';
import { getErrorMessage } from '../utils/errorHandler';

const STORAGE_KEY = 'problem-form-draft';
const STEPS: FormStep[] = ['details', 'test-cases', 'tags', 'preview'];

/**
 * Problem form management hook
 *
 * @returns Form state and actions
 *
 * @example
 * ```tsx
 * const { data, errors, currentStep, updateField, nextStep, submitForm } = useProblemForm();
 *
 * <Input
 *   value={data.title}
 *   onChange={(e) => updateField('title', e.target.value)}
 *   error={!!errors.title}
 * />
 * ```
 */
export const useProblemForm = (): ProblemFormState & ProblemFormActions => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // Initialize form data
  const [data, setData] = useState<ProblemFormData>(INITIAL_FORM_DATA);

  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    if (isDirty) {
      saveDraft();
    }
  }, [data, isDirty]);

  /**
   * Update a form field
   */
  const updateField = useCallback(<K extends keyof ProblemFormData>(
    field: K,
    value: ProblemFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  /**
   * Add a test case
   */
  const addTestCase = useCallback((testCase: FormTestCase) => {
    setData((prev) => ({
      ...prev,
      test_cases: [...prev.test_cases, { ...testCase, tempId: crypto.randomUUID() }],
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update a test case
   */
  const updateTestCase = useCallback((index: number, updates: Partial<FormTestCase>) => {
    setData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.map((tc, i) =>
        i === index ? { ...tc, ...updates } : tc
      ),
    }));
    setIsDirty(true);
  }, []);

  /**
   * Remove a test case
   */
  const removeTestCase = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, []);

  /**
   * Add a tag
   */
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;

    if (data.tags.includes(trimmedTag)) {
      toast.error('Tag already added');
      return;
    }

    if (data.tags.length >= FORM_LIMITS.MAX_TAGS) {
      toast.error(`Maximum ${FORM_LIMITS.MAX_TAGS} tags allowed`);
      return;
    }

    setData((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
    }));
    setIsDirty(true);
  }, [data.tags]);

  /**
   * Remove a tag
   */
  const removeTag = useCallback((tag: string) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
    setIsDirty(true);
  }, []);

  /**
   * Validate problem details step
   */
  const validateDetails = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.title || data.title.trim().length < FORM_LIMITS.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${FORM_LIMITS.TITLE_MIN_LENGTH} characters`;
    } else if (data.title.length > FORM_LIMITS.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must not exceed ${FORM_LIMITS.TITLE_MAX_LENGTH} characters`;
    }

    if (!data.description || data.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (data.description.length > FORM_LIMITS.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must not exceed ${FORM_LIMITS.DESCRIPTION_MAX_LENGTH} characters`;
    }

    if (!data.input_description || data.input_description.trim().length < 10) {
      newErrors.input_description = 'Input description must be at least 10 characters';
    } else if (data.input_description.length > 10000) {
      newErrors.input_description = 'Input description must not exceed 10000 characters';
    }

    if (!data.output_description || data.output_description.trim().length < 10) {
      newErrors.output_description = 'Output description must be at least 10 characters';
    } else if (data.output_description.length > 10000) {
      newErrors.output_description = 'Output description must not exceed 10000 characters';
    }

    if (!data.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }

    if (data.time_limit < FORM_LIMITS.TIME_LIMIT_MIN || data.time_limit > FORM_LIMITS.TIME_LIMIT_MAX) {
      newErrors.time_limit = `Time limit must be between ${FORM_LIMITS.TIME_LIMIT_MIN} and ${FORM_LIMITS.TIME_LIMIT_MAX} ms`;
    }

    if (data.memory_limit < FORM_LIMITS.MEMORY_LIMIT_MIN || data.memory_limit > FORM_LIMITS.MEMORY_LIMIT_MAX) {
      newErrors.memory_limit = `Memory limit must be between ${FORM_LIMITS.MEMORY_LIMIT_MIN} and ${FORM_LIMITS.MEMORY_LIMIT_MAX} MB`;
    }

    return newErrors;
  };

  /**
   * Validate test cases step
   */
  const validateTestCases = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (data.test_cases.length < FORM_LIMITS.MIN_TEST_CASES) {
      newErrors.test_cases = 'At least one test case is required';
    } else if (data.test_cases.length > FORM_LIMITS.MAX_TEST_CASES) {
      newErrors.test_cases = `Maximum ${FORM_LIMITS.MAX_TEST_CASES} test cases allowed`;
    }

    // Validate individual test cases
    const testCaseErrors: Record<string, any> = {};
    data.test_cases.forEach((tc, index) => {
      const tcErrors: any = {};

      if (!tc.input || tc.input.trim() === '') {
        tcErrors.input = 'Input is required';
      }

      if (!tc.expected_output || tc.expected_output.trim() === '') {
        tcErrors.expected_output = 'Expected output is required';
      }

      if (Object.keys(tcErrors).length > 0) {
        testCaseErrors[tc.tempId || index] = tcErrors;
      }
    });

    if (Object.keys(testCaseErrors).length > 0) {
      newErrors.testCaseErrors = testCaseErrors;
    }

    return newErrors;
  };

  /**
   * Validate tags step (completely optional)
   */
  const validateTags = (): FormErrors => {
    const newErrors: FormErrors = {};
    // Tags are completely optional - no validation or suggestions
    return newErrors;
  };

  /**
   * Validate a specific step
   */
  const validateStep = useCallback((step: FormStep): boolean => {
    let stepErrors: FormErrors = {};

    switch (step) {
      case 'details':
        stepErrors = validateDetails();
        break;
      case 'test-cases':
        stepErrors = validateTestCases();
        break;
      case 'tags':
        stepErrors = validateTags();
        break;
      case 'preview':
        // Preview step doesn't have validation, it shows all errors
        stepErrors = {
          ...validateDetails(),
          ...validateTestCases(),
          ...validateTags(),
        };
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [data]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const allErrors = {
      ...validateDetails(),
      ...validateTestCases(),
      ...validateTags(),
    };

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [data]);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  }, [currentStep, validateStep]);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback((step: FormStep) => {
    setCurrentStep(step);
  }, []);

  /**
   * Submit the form
   */
  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      // Go to first step with errors
      if (errors.title || errors.description || errors.difficulty) {
        goToStep('details');
      } else if (errors.test_cases) {
        goToStep('test-cases');
      } else if (errors.tags) {
        goToStep('tags');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to API format
      // Note: author_id and status are set by backend based on authenticated user
      const problemInput: ProblemInput = {
        title: data.title.trim(),
        description: data.description.trim(),
        input_description:data.input_description,
        output_description:data.output_description,
        difficulty: data.difficulty,
        time_limit: data.time_limit,
        memory_limit: data.memory_limit,
        constraints: data.constraints?.trim() || undefined,
        test_cases: data.test_cases.map((tc) => ({
          input: tc.input,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample,
          order_index: tc.order_index,
          explanation: tc.explanation,
        })),
        tags: data.tags,
      };

      await createProblem(axiosPrivate, problemInput);

      toast.success('Problem created successfully!');

      // Clear draft from localStorage
      localStorage.removeItem(STORAGE_KEY);
      setIsDirty(false);

      // Navigate to problems list or the new problem page
      navigate('/problems');
    } catch (error) {
      console.error('Failed to create problem:', error);
      const errorMessage = getErrorMessage(error, 'Failed to create problem. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validateForm, axiosPrivate, navigate]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setData(INITIAL_FORM_DATA);
    setCurrentStep('details');
    setErrors({});
    setIsDirty(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setData(draft);
        setIsDirty(false);
        toast.success('Draft loaded');
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [data]);

  return {
    // State
    data,
    currentStep,
    errors,
    isSubmitting,
    isDirty,
    uploadedFiles: [],

    // Actions
    updateField,
    addTestCase,
    updateTestCase,
    removeTestCase,
    addTag,
    removeTag,
    setErrors,
    nextStep,
    previousStep,
    goToStep,
    validateStep,
    validateForm,
    submitForm,
    resetForm,
    loadDraft,
    saveDraft,
  };
};
