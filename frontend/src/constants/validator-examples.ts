/**
 * Example custom validators for problem authors
 *
 * These examples demonstrate common use cases for custom validators:
 * - Unordered output (lines can appear in any order)
 * - Floating-point tolerance (accept values within epsilon)
 * - Multiple valid formats
 */

export interface ValidatorExample {
  id: string;
  name: string;
  description: string;
  code: string;
  useCase: string;
}

export const VALIDATOR_EXAMPLES: ValidatorExample[] = [
  {
    id: 'unordered-lines',
    name: 'Unordered Lines',
    description: 'Accept output with lines in any order',
    useCase: 'Use when the problem allows output lines to appear in any sequence (e.g., printing a set of values)',
    code: `import json
import sys

def validate(data):
    """Validate that output lines match, ignoring order."""
    actual_lines = sorted(data['actual'].strip().split('\\n'))
    expected_lines = sorted(data['expected'].strip().split('\\n'))

    if actual_lines != expected_lines:
        sys.stderr.write(f"ERROR: Lines don't match (order ignored)\\n")
        sys.stderr.write(f"Expected lines (sorted): {expected_lines}\\n")
        sys.stderr.write(f"Actual lines (sorted): {actual_lines}\\n")
        return {"passed": False}

    sys.stderr.write(f"✓ All {len(actual_lines)} lines match (order ignored)\\n")
    return {"passed": True}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`,
  },
  {
    id: 'floating-point-tolerance',
    name: 'Floating Point Tolerance',
    description: 'Accept floating-point values within epsilon (1e-6)',
    useCase: 'Use ONLY for problems with DECIMAL output (e.g., 3.14159, 2.71828). DO NOT use for integer positions or counts.',
    code: `import json
import sys

def validate(data):
    """
    Validate floating-point output with tolerance.

    WARNING: Use this ONLY for problems that output decimal numbers.
    For integer outputs (positions, counts), use exact match or custom validator.
    """
    epsilon = 1e-6

    try:
        actual_values = [float(x) for x in data['actual'].strip().split()]
        expected_values = [float(x) for x in data['expected'].strip().split()]

        if len(actual_values) != len(expected_values):
            sys.stderr.write(f"ERROR: Different number of values. Expected {len(expected_values)}, got {len(actual_values)}\\n")
            return {"passed": False}

        for i, (actual, expected) in enumerate(zip(actual_values, expected_values)):
            diff = abs(actual - expected)
            if diff > epsilon:
                sys.stderr.write(f"ERROR: Value {i+1}: |{actual} - {expected}| = {diff} > {epsilon}\\n")
                return {"passed": False}

        sys.stderr.write(f"✓ All values within epsilon={epsilon}\\n")
        return {"passed": True}
    except ValueError as e:
        sys.stderr.write(f"ERROR: Could not parse as floating-point numbers: {str(e)}\\n")
        sys.stderr.write(f"Actual output: {data['actual']}\\n")
        sys.stderr.write(f"Expected output: {data['expected']}\\n")
        sys.stderr.write(f"This validator is for DECIMAL numbers only. For integers, use a different validator.\\n")
        return {"passed": False}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`,
  },
  {
    id: 'case-insensitive',
    name: 'Case Insensitive',
    description: 'Accept output regardless of letter case',
    useCase: 'Use when the problem allows answers in any case (e.g., "yes"/"YES"/"Yes" are all valid)',
    code: `import json
import sys

def validate(data):
    """Validate output ignoring case differences."""
    actual = data['actual'].strip().lower()
    expected = data['expected'].strip().lower()

    if actual != expected:
        sys.stderr.write(f"ERROR: Output doesn't match (case ignored)\\n")
        sys.stderr.write(f"Expected (lowercase): '{expected}'\\n")
        sys.stderr.write(f"Actual (lowercase): '{actual}'\\n")
        return {"passed": False}

    sys.stderr.write(f"✓ Output matches (case ignored)\\n")
    return {"passed": True}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`,
  },
  {
    id: 'unordered-tokens',
    name: 'Unordered Tokens',
    description: 'Accept tokens (words) in any order on each line',
    useCase: 'Use when each line can have tokens in any order (e.g., "1 2 3" equals "3 1 2")',
    code: `import json
import sys

def validate(data):
    """Validate that tokens on each line match, ignoring order."""
    actual_lines = data['actual'].strip().split('\\n')
    expected_lines = data['expected'].strip().split('\\n')

    if len(actual_lines) != len(expected_lines):
        sys.stderr.write(f"ERROR: Different number of lines. Expected {len(expected_lines)}, got {len(actual_lines)}\\n")
        return {"passed": False}

    for line_num, (actual_line, expected_line) in enumerate(zip(actual_lines, expected_lines), 1):
        actual_tokens = sorted(actual_line.split())
        expected_tokens = sorted(expected_line.split())

        if actual_tokens != expected_tokens:
            sys.stderr.write(f"ERROR: Line {line_num} tokens don't match (order ignored)\\n")
            sys.stderr.write(f"Expected tokens (sorted): {expected_tokens}\\n")
            sys.stderr.write(f"Actual tokens (sorted): {actual_tokens}\\n")
            return {"passed": False}

    sys.stderr.write(f"✓ All {len(actual_lines)} lines match (token order ignored)\\n")
    return {"passed": True}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`,
  },
  {
    id: 'whitespace-flexible',
    name: 'Flexible Whitespace',
    description: 'Accept output with any amount of whitespace between tokens',
    useCase: 'Use when the exact spacing doesn\'t matter (e.g., "1  2   3" equals "1 2 3")',
    code: `import json
import sys

def validate(data):
    """Validate output ignoring extra whitespace."""
    # Split by any whitespace and rejoin with single spaces
    actual = ' '.join(data['actual'].split())
    expected = ' '.join(data['expected'].split())

    if actual != expected:
        sys.stderr.write(f"ERROR: Output doesn't match (whitespace normalized)\\n")
        sys.stderr.write(f"Expected (normalized): '{expected}'\\n")
        sys.stderr.write(f"Actual (normalized): '{actual}'\\n")
        return {"passed": False}

    sys.stderr.write(f"✓ Output matches (whitespace ignored)\\n")
    return {"passed": True}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`,
  },
];

/**
 * Get validator example by ID
 */
export function getValidatorExample(id: string): ValidatorExample | undefined {
  return VALIDATOR_EXAMPLES.find(example => example.id === id);
}

/**
 * Default starter code for custom validator
 */
export const DEFAULT_VALIDATOR_CODE = `import json
import sys

def validate(data):
    """
    Custom validator for this problem.

    Args:
        data: Dictionary with keys:
            - input: The test case input
            - expected: The expected output
            - actual: The user's output

    Returns:
        Dictionary with key 'passed': True if valid, False otherwise
    """
    # TODO: Implement your validation logic here
    # For now, this does exact string matching
    actual = data['actual'].strip()
    expected = data['expected'].strip()

    return {"passed": actual == expected}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))`;
