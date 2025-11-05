/**
 * ValidatorStep Component
 *
 * Form step for adding an optional custom validator to a problem.
 * Allows authors to write Python validator code and test it against sample test cases.
 *
 * @module components/problem-form/ValidatorStep
 */

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, Play, Info } from 'lucide-react';
import { Label } from '../ui/Label';
import { Select } from '../ui/select';
import { Switch } from '../ui/Switch';
import { ValidatorTestResults } from './ValidatorTestResults';
import { VALIDATOR_EXAMPLES, DEFAULT_VALIDATOR_CODE, } from '../../constants/validator-examples';
import { testValidator, type ValidateValidatorResponse } from '../../api/problems';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import type { ProblemFormData, FormErrors } from '../../types/problem-form';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface ValidatorStepProps {
  data: ProblemFormData;
  errors: FormErrors;
  onUpdate: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
}

/**
 * Form step for custom validator configuration
 *
 * @param props - Component props
 * @param props.data - Current form data
 * @param props.errors - Validation errors
 * @param props.onUpdate - Function to update form fields
 *
 * @example
 * ```tsx
 * <ValidatorStep
 *   data={formData}
 *   errors={formErrors}
 *   onUpdate={updateField}
 * />
 * ```
 */
export function ValidatorStep({ data, errors, onUpdate }: ValidatorStepProps) {
  const axiosPrivate = useAxiosPrivate();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<ValidateValidatorResponse | null>(null);

  // State for validator toggle - default OFF
  const [useValidatorEnabled, setUseValidatorEnabled] = useState(false);

  // Count sample and total test cases
  const sampleTestCases = data.test_cases.filter((tc) => tc.is_sample);
  const totalTestCases = data.test_cases.length;

  const handleToggleValidator = (enabled: boolean) => {
    setUseValidatorEnabled(enabled);

    if (enabled) {
      // Load default template when enabling
      onUpdate('validator_code', DEFAULT_VALIDATOR_CODE);
      toast.success('Custom validator enabled - default template loaded');
    } else {
      // Clear validator code when disabling
      onUpdate('validator_code', undefined);
      setTestResults(null); // Clear test results
      toast.success('Custom validator disabled - using exact match validation');
    }
  };

  const handleTestValidator = async () => {
    if (!data.validator_code?.trim()) {
      toast.error('Please enter validator code before testing');
      return;
    }

    if (totalTestCases === 0) {
      toast.error('Please add at least one test case in step 2 before testing the validator');
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      // Convert ALL test cases to API format (samples + hidden) to catch edge cases
      const testCases = data.test_cases.map((tc) => ({
        id: tc.tempId || '',
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample,
        order_index: tc.order_index,
        problem_id: '',
      }));

      const results = await testValidator(
        axiosPrivate,
        data.validator_code,
        data.validator_language,
        testCases
      );

      setTestResults(results);

      if (results.valid) {
        toast.success('Validator passed all sample test cases!');
      } else {
        toast.error('Validator failed some test cases. Review the results below.');
      }
    } catch (error: any) {
      console.error('Failed to test validator:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to test validator. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleExampleSelect = (exampleId: string) => {
    if (!exampleId) return;

    const example = VALIDATOR_EXAMPLES.find((ex) => ex.id === exampleId);
    if (example) {
      onUpdate('validator_code', example.code);
      toast.success(`Loaded example: ${example.name}`);
    }
  };

  const handleResetToDefault = () => {
    onUpdate('validator_code', DEFAULT_VALIDATOR_CODE);
    setTestResults(null); // Clear test results
    toast.success('Reset to default template');
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg">
        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-text">
            Optional: Custom Validator
          </p>
          <p className="text-xs text-text-muted">
            Enable custom validator if your problem has multiple valid solutions (e.g., unordered output, floating-point tolerance).
            By default, exact match validation will be used.
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-text">Use Custom Validator</p>
          <p className="text-xs text-text-muted">
            {useValidatorEnabled
              ? 'Custom validator is enabled - define your validation logic below'
              : 'Using default exact match validation'}
          </p>
        </div>
        <Switch
          checked={useValidatorEnabled}
          onCheckedChange={handleToggleValidator}
        />
      </div>

      {/* Validator UI (only shown when enabled) */}
      {useValidatorEnabled && (
        <>
          {/* Example Selector */}
          <div>
            <Label htmlFor="validator-example">Load Example Validator (Optional)</Label>
            <div className="flex gap-2">
              <Select
                id="validator-example"
                value=""
                onChange={(e) => handleExampleSelect(e.target.value)}
                className="flex-1"
              >
                <option value="">Select a pre-built example...</option>
                {VALIDATOR_EXAMPLES.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.name} - {example.description}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleResetToDefault}
                className="whitespace-nowrap"
              >
                Reset to Default
              </Button>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Choose from common validation patterns or write your own below
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <Label htmlFor="validator-language">Validator Language</Label>
            <Select
              id="validator-language"
              value={data.validator_language}
              onChange={(e) => onUpdate('validator_language', e.target.value)}
              disabled
            >
              <option value="python">Python</option>
            </Select>
            <p className="mt-1 text-xs text-text-muted">
              Currently only Python validators are supported
            </p>
            {errors.validator_language && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm font-medium">
                <span className="text-base">❌</span>
                {errors.validator_language}
              </div>
            )}
          </div>

          {/* Validator Code Editor */}
          <div>
            <Label htmlFor="validator-code">Validator Code</Label>
            <div className="mt-2 border border-border rounded-lg overflow-hidden">
              <Editor
                height="400px"
                language="python"
                value={data.validator_code || ''}
                onChange={(value) => onUpdate('validator_code', value)}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Write a Python function that validates user output. The validator receives input, expected output, and actual output via JSON stdin.
            </p>
            {errors.validator_code && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm font-medium">
                <span className="text-base">❌</span>
                {errors.validator_code}
              </div>
            )}
          </div>

          {/* Test Button */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleTestValidator}
              disabled={isTesting || !data.validator_code?.trim() || totalTestCases === 0}
            >
              <Play className="h-4 w-4" />
              {isTesting ? 'Testing Validator...' : 'Test Validator'}
            </Button>
            {totalTestCases === 0 && (
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>No test cases available. Add at least one in step 2.</span>
              </div>
            )}
            {totalTestCases > 0 && (
              <span className="text-sm text-text-muted">
                Will test against {totalTestCases} test case{totalTestCases > 1 ? 's' : ''} ({sampleTestCases.length} sample, {totalTestCases - sampleTestCases.length} hidden)
              </span>
            )}
          </div>

          {/* Test Results */}
          {testResults && (
            <ValidatorTestResults
              results={testResults.results}
              valid={testResults.valid}
              message={testResults.message}
            />
          )}

          {/* Help Section */}
          <div className="p-4 bg-background border border-border rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-text">Validator Interface</h4>
            <div className="space-y-2 text-xs text-text-muted">
              <p>Your validator should:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Read JSON from stdin with keys: <code className="px-1 py-0.5 bg-card rounded">input</code>, <code className="px-1 py-0.5 bg-card rounded">expected</code>, <code className="px-1 py-0.5 bg-card rounded">actual</code></li>
                <li>Validate whether the actual output is correct</li>
                <li>Print JSON to stdout with key: <code className="px-1 py-0.5 bg-card rounded">passed</code> (boolean)</li>
              </ol>
              <p className="mt-2">Example:</p>
              <pre className="p-2 bg-card rounded overflow-x-auto">
{`import json
import sys

input_data = json.loads(sys.stdin.read())
result = {"passed": input_data["actual"] == input_data["expected"]}
print(json.dumps(result))`}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
