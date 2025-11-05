import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { FileUploadZone } from '../components/ui/FileUploadZone';
import { ProblemDetailsForm } from '../components/problem-form/ProblemDetailsForm';
import { ValidatorStep } from '../components/problem-form/ValidatorStep';
import { useProblemForm } from '../hooks/useProblemForm';
import { parseTestCaseFiles } from '../utils/testCaseParser';
import { downloadSampleAsText } from '../utils/downloadSample';
import type {FormStep } from '../types/problem-form';

export const AddProblemPage: React.FC = () => {
  const navigate = useNavigate();
  const form = useProblemForm();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');

  const steps: { id: FormStep; title: string; description: string }[] = [
    { id: 'details', title: 'Problem Details', description: 'Basic information about the problem' },
    { id: 'test-cases', title: 'Test Cases', description: 'Add test cases manually or bulk upload' },
    { id: 'validator', title: 'Custom Validator', description: 'Optional: Add custom output validator' },
    { id: 'tags', title: 'Tags', description: 'Categorize your problem' },
    { id: 'preview', title: 'Preview & Submit', description: 'Review and submit your problem' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === form.currentStep);

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles([...uploadedFiles, ...files]);

    try {
      const result = await parseTestCaseFiles([...uploadedFiles, ...files]);

      if (result.errors.length > 0) {
        result.errors.forEach((error) => toast.error(error));
        return;
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach((warning) => toast(warning, { icon: '⚠️' }));
      }

      // Add parsed test cases
      result.testCases.forEach((tc, index) => {
        form.addTestCase({
          input: tc.input,
          expected_output: tc.expected_output,
          is_sample: false,
          order_index: form.data.test_cases.length + index,
          explanation: undefined,
        });
      });

      toast.success(`Added ${result.testCases.length} test cases`);
    } catch (error) {
      toast.error('Failed to parse test case files');
      console.error(error);
    }
  };

  const handleAddManualTestCase = () => {
    form.addTestCase({
      input: '',
      expected_output: '',
      is_sample: false,
      order_index: form.data.test_cases.length,
      explanation: undefined,
      tempId: crypto.randomUUID(),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      form.addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Problem</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {steps[currentStepIndex].description}
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-1"
                onClick={() => form.goToStep(step.id)}
              >
                <div className="flex items-center cursor-pointer">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${
                        index <= currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden md:inline ${
                      index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="p-8">
          {/* Step 1: Problem Details */}
          {form.currentStep === 'details' && (
            <ProblemDetailsForm
              data={form.data}
              errors={form.errors}
              onUpdate={form.updateField}
            />
          )}

          {/* Step 2: Test Cases */}
          {form.currentStep === 'test-cases' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Test Cases</h2>
                <p className="text-muted-foreground text-sm">
                  Add test cases manually or upload .in and .out files in bulk
                </p>
              </div>

              {/* Bulk Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Bulk Upload</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={downloadSampleAsText}
                  >
                    📥 Download Sample Format
                  </Button>
                </div>
                <FileUploadZone
                  accept=".in,.out"
                  multiple
                  onFilesSelected={handleFileUpload}
                  files={uploadedFiles}
                  onFileRemove={(index) => {
                    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                  }}
                  label="Upload .in and .out files"
                />
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label>Manual Entry</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddManualTestCase}
                  >
                    + Add Test Case
                  </Button>
                </div>

                {form.data.test_cases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No test cases added yet</p>
                    <p className="text-sm mt-1">Click "Add Test Case" or upload files</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.data.test_cases.map((tc, index) => (
                      <Card key={tc.tempId || index} className="p-4 border-border">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-foreground">Test Case {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.removeTestCase(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label>Input</Label>
                            <Textarea
                              value={tc.input}
                              onChange={(e) =>
                                form.updateTestCase(index, { input: e.target.value })
                              }
                              placeholder="Test case input"
                              rows={3}
                              className="font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label>Expected Output</Label>
                            <Textarea
                              value={tc.expected_output}
                              onChange={(e) =>
                                form.updateTestCase(index, { expected_output: e.target.value })
                              }
                              placeholder="Expected output"
                              rows={3}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.is_sample}
                              onChange={(e) =>
                                form.updateTestCase(index, { is_sample: e.target.checked })
                              }
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">
                              Show as sample (visible to users)
                            </span>
                          </label>
                        </div>

                        {tc.is_sample && (
                          <div className="mt-3">
                            <Label>Explanation (Optional)</Label>
                            <Input
                              value={tc.explanation || ''}
                              onChange={(e) =>
                                form.updateTestCase(index, { explanation: e.target.value })
                              }
                              placeholder="Explain this test case..."
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {form.errors.test_cases && (
                  <p className="mt-2 text-sm text-destructive">{form.errors.test_cases}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Validator (Optional) */}
          {form.currentStep === 'validator' && (
            <ValidatorStep
              data={form.data}
              errors={form.errors}
              onUpdate={form.updateField}
            />
          )}

          {/* Step 4: Tags */}
          {form.currentStep === 'tags' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Tags</h2>
                <p className="text-muted-foreground text-sm">
                  Add tags to help users discover your problem
                </p>
              </div>

              <div>
                <Label>Add Tag</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="e.g., array, dynamic-programming"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              {form.data.tags.length > 0 && (
                <div>
                  <Label>Added Tags ({form.data.tags.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => form.removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 Common tags: array, string, hash-table, dynamic-programming, greedy, math,
                  sorting, binary-search, tree, graph
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Preview */}
          {form.currentStep === 'preview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Review Your Problem</h2>
                <p className="text-muted-foreground text-sm">
                  Please review all details before submitting
                </p>
              </div>

              {/* Problem Details Preview */}
              <Card className="p-4 border-border">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Problem Details</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.goToStep('details')}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="font-medium text-muted-foreground w-32">Title:</dt>
                    <dd className="text-foreground">{form.data.title || '(Not set)'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-muted-foreground w-32">Difficulty:</dt>
                    <dd className="text-foreground capitalize">{form.data.difficulty}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-muted-foreground w-32">Time Limit:</dt>
                    <dd className="text-foreground">{form.data.time_limit} ms</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-muted-foreground w-32">Memory Limit:</dt>
                    <dd className="text-foreground">{form.data.memory_limit} MB</dd>
                  </div>
                </dl>
              </Card>

              {/* Test Cases Preview */}
              <Card className="p-4 border-border">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Test Cases</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.goToStep('test-cases')}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-foreground">
                  Total: {form.data.test_cases.length} test cases
                  {form.data.test_cases.filter((tc) => tc.is_sample).length > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({form.data.test_cases.filter((tc) => tc.is_sample).length} samples)
                    </span>
                  )}
                </p>
              </Card>

              {/* Validator Preview */}
              <Card className="p-4 border-border">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Custom Validator</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.goToStep('validator')}
                  >
                    Edit
                  </Button>
                </div>
                {form.data.validator_code?.trim() ? (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">Language:</span>{' '}
                      {form.data.validator_language}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">Code length:</span>{' '}
                      {form.data.validator_code.length} characters
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                      ✅ Custom validator configured
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No custom validator - exact match validation will be used
                  </p>
                )}
              </Card>

              {/* Tags Preview */}
              <Card className="p-4 border-border">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Tags</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.goToStep('tags')}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.data.tags.length > 0 ? (
                    form.data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags added</p>
                  )}
                </div>
              </Card>

              {/* Validation Errors */}
              {Object.keys(form.errors).length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive">
                  <p className="text-destructive font-medium mb-2">Please fix the following errors:</p>
                  <ul className="text-sm text-destructive space-y-1">
                    {Object.entries(form.errors).map(([key, value]) => (
                      <li key={key}>• {value as string}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={form.previousStep}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {form.isDirty && (
                <Button type="button" variant="ghost" onClick={form.saveDraft}>
                  Save Draft
                </Button>
              )}

              {currentStepIndex < steps.length - 1 ? (
                <Button type="button" onClick={form.nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={form.submitForm}
                  disabled={form.isSubmitting}
                  className="min-w-32"
                >
                  {form.isSubmitting ? 'Submitting...' : 'Submit Problem'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
