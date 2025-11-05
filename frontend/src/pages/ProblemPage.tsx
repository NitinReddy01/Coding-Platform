import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCode, setLanguage } from '../store/slices/editorSlice';
import { useProblem } from '../hooks/useProblem';
import { useSubmission } from '../hooks/useSubmission';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { getLatestSubmission } from '../api/submissions';
import { ProblemLayout } from '../components/layout/ProblemLayout';

export function ProblemPage() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const axiosPrivate = useAxiosPrivate();
  const [loadingLatestSubmission, setLoadingLatestSubmission] = useState(false);

  useEffect(() => {
    if (!title) {
      navigate('/problems', { replace: true });
    }
  }, [title, navigate]);

  const problemTitle = title ? decodeURIComponent(title) : '';

  const { problem, loading, error } = useProblem(problemTitle, 'practice');
  const {
    results,
    isRunning,
    isSubmitting,
    error: submissionError,
    status,
    runtimeMs,
    memoryUsedMb,
    testCasesPassed,
    testCasesTotal,
    errorMessage,
    sampleTestResults,
    isPolling,
    submissionType,
    runCode,
    submitCode,
  } = useSubmission();
  const { code, language, languages } = useAppSelector((state) => state.editor);

  // Fetch latest submission when problem is loaded
  useEffect(() => {
    if (!problem) return;

    const fetchLatestSubmission = async () => {
      setLoadingLatestSubmission(true);
      try {
        const latestSubmission = await getLatestSubmission(axiosPrivate, problem.id);
        // Populate editor with previous submission
        dispatch(setCode(latestSubmission.code));
        dispatch(setLanguage(latestSubmission.language));
      } catch (err) {
        // No previous submission found - set default code for selected language
        if (languages.length > 0) {
          const selectedLanguage = languages.find((lang) => lang.code === language);
          if (selectedLanguage) {
            dispatch(setCode(selectedLanguage.default_code));
          }
        }
      } finally {
        setLoadingLatestSubmission(false);
      }
    };

    fetchLatestSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, axiosPrivate, dispatch, languages]);

  // Set default code when language changes (but only if no code exists)
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

    runCode(code, language, problem.id);
  }, [problem, code, language, runCode]);

  const handleSubmit = useCallback(() => {
    if (!problem || !code.trim()) return;

    submitCode(code, language, problem.id);
  }, [problem, code, language, submitCode]);

  // Keyboard shortcuts
  // Cmd+' (Mac) or Ctrl+' (Windows/Linux) - Run Code
  useKeyboardShortcut('Quote', handleRun, {
    ctrlKey: true,
    disabled: isRunning || isSubmitting || isPolling || !problem || !code.trim(),
  });

  // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) - Submit Code
  useKeyboardShortcut('Enter', handleSubmit, {
    ctrlKey: true,
    disabled: isRunning || isSubmitting || isPolling || !problem || !code.trim(),
  });

  if (loading || loadingLatestSubmission) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading problem...' : 'Loading your previous submission...'}
          </p>
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
      runCodeFn={runCode}
      submitCodeFn={submitCode}
      results={results}
      isRunning={isRunning}
      isSubmitting={isSubmitting}
      submissionError={submissionError}
      status={status}
      isPolling={isPolling}
      runtimeMs={runtimeMs}
      memoryUsedMb={memoryUsedMb}
      testCasesPassed={testCasesPassed}
      testCasesTotal={testCasesTotal}
      errorMessage={errorMessage}
      sampleTestResults={sampleTestResults}
      submissionType={submissionType}
    />
  );
}
