import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCode } from '../store/slices/editorSlice';
import { useProblem } from '../hooks/useProblem';
import { useSubmission } from '../hooks/useSubmission';
import { ProblemLayout } from '../components/layout/ProblemLayout';
import type { Submission } from '../types';

export function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // Hooks now manage their own state locally
  const { problem, loading, error } = useProblem("Two Sum", 'practice');
  const { results, isRunning, isSubmitting, error: submissionError, runCode, submitCode } = useSubmission(true);
  const { code, language, languages } = useAppSelector((state) => state.editor);
  // Set default code when component mounts or language changes
  useEffect(() => {
    if (!code && languages.length > 0) {
      const selectedLanguage = languages.find((lang) => lang.code === language);
      if (selectedLanguage) {
        dispatch(setCode(selectedLanguage.default_code));
      }
    }
  }, [language, languages, code, dispatch]);

  const handleRun = useCallback(() => {
    if (!problem || !code.trim()) return;

    const submission: Submission = {
      code,
      language,
      test_cases: problem.sample_test_cases,
      time_limit: problem.time_limit,
      memory_limit: problem.memory_limit,
    };

    runCode(submission);
  }, [problem, code, language, runCode]);

  const handleSubmit = useCallback(() => {
    if (!problem || !code.trim()) return;

    const submission: Submission = {
      code,
      language,
      test_cases: problem.sample_test_cases, // In real scenario, this would be all test cases
      time_limit: problem.time_limit,
      memory_limit: problem.memory_limit,
    };

    submitCode(submission);
  }, [problem, code, language, submitCode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-500">Error loading problem</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Problem not found</p>
      </div>
    );
  }

  return (
    <ProblemLayout
      problem={problem}
      onRun={handleRun}
      onSubmit={handleSubmit}
      results={results}
      isRunning={isRunning}
      isSubmitting={isSubmitting}
      submissionError={submissionError}
    />
  );
}
