import type { TestCase } from '../types';

export interface ParsedTestCase {
  input: string;
  expected_output: string;
  order_index: number;
  is_sample: boolean;
  filename: string;
}

export interface ParseResult {
  testCases: ParsedTestCase[];
  errors: string[];
  warnings: string[];
}

/**
 * Extracts the numeric prefix from a filename
 * Examples: "1.in" -> 1, "test_5.out" -> 5, "case10.in" -> 10
 */
const extractFileNumber = (filename: string): number | null => {
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Reads file content as text
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Parses uploaded .in and .out files into test cases
 *
 * @param files - Array of uploaded files (mix of .in and .out files)
 * @returns ParseResult containing test cases, errors, and warnings
 *
 * @example
 * ```typescript
 * const files = [file1_in, file1_out, file2_in, file2_out];
 * const result = await parseTestCaseFiles(files);
 *
 * if (result.errors.length > 0) {
 *   console.error('Parsing errors:', result.errors);
 * }
 *
 * console.log('Test cases:', result.testCases);
 * ```
 */
export const parseTestCaseFiles = async (files: File[]): Promise<ParseResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const inputFiles = new Map<number, File>();
  const outputFiles = new Map<number, File>();

  // Separate .in and .out files
  for (const file of files) {
    const filename = file.name.toLowerCase();
    const fileNumber = extractFileNumber(file.name);

    if (fileNumber === null) {
      errors.push(`File "${file.name}" does not have a numeric identifier`);
      continue;
    }

    if (filename.endsWith('.in')) {
      if (inputFiles.has(fileNumber)) {
        warnings.push(`Duplicate input file for test case ${fileNumber}: ${file.name}`);
      }
      inputFiles.set(fileNumber, file);
    } else if (filename.endsWith('.out')) {
      if (outputFiles.has(fileNumber)) {
        warnings.push(`Duplicate output file for test case ${fileNumber}: ${file.name}`);
      }
      outputFiles.set(fileNumber, file);
    } else {
      errors.push(`File "${file.name}" is not a .in or .out file`);
    }
  }

  // Find all test case numbers
  const allNumbers = new Set([...inputFiles.keys(), ...outputFiles.keys()]);
  const testCaseNumbers = Array.from(allNumbers).sort((a, b) => a - b);

  // Check for missing pairs
  for (const num of testCaseNumbers) {
    if (!inputFiles.has(num)) {
      errors.push(`Missing input file (.in) for test case ${num}`);
    }
    if (!outputFiles.has(num)) {
      errors.push(`Missing output file (.out) for test case ${num}`);
    }
  }

  // If there are pairing errors, return early
  if (errors.length > 0) {
    return { testCases: [], errors, warnings };
  }

  // Read and parse test cases
  const testCases: ParsedTestCase[] = [];

  for (let i = 0; i < testCaseNumbers.length; i++) {
    const num = testCaseNumbers[i];
    const inputFile = inputFiles.get(num)!;
    const outputFile = outputFiles.get(num)!;

    try {
      const [input, expectedOutput] = await Promise.all([
        readFileAsText(inputFile),
        readFileAsText(outputFile),
      ]);

      testCases.push({
        input: input.trim(),
        expected_output: expectedOutput.trim(),
        order_index: i,
        is_sample: false, // User can mark as sample later
        filename: `${num}.in / ${num}.out`,
      });
    } catch (error) {
      errors.push(
        `Failed to read test case ${num}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return { testCases, errors, warnings };
};

/**
 * Validates test case data
 */
export const validateTestCase = (testCase: Partial<ParsedTestCase>): string[] => {
  const errors: string[] = [];

  if (!testCase.input || testCase.input.trim() === '') {
    errors.push('Input cannot be empty');
  }

  if (!testCase.expected_output || testCase.expected_output.trim() === '') {
    errors.push('Expected output cannot be empty');
  }

  if (testCase.order_index !== undefined && testCase.order_index < 0) {
    errors.push('Order index must be non-negative');
  }

  return errors;
};

/**
 * Converts ParsedTestCase to TestCase format expected by the API
 */
export const convertToApiFormat = (testCases: ParsedTestCase[]): Omit<TestCase, 'id' | 'problem_id' | 'created_at'>[] => {
  return testCases.map((tc) => ({
    input: tc.input,
    expected_output: tc.expected_output,
    is_sample: tc.is_sample,
    order_index: tc.order_index,
    explanation: undefined,
  }));
};
