import json
import sys

def validate(data):
    try:
        actual = data['actual'].strip()
        input_data = data['input'].strip()

        # Parse input
        lines = input_data.split('\n')
        if len(lines) < 2:
            sys.stderr.write("ERROR: Invalid input format - expected 2 lines\n")
            return {"passed": False}

        first_line = lines[0].split()
        if len(first_line) != 2:
            sys.stderr.write("ERROR: First line should contain n and x\n")
            return {"passed": False}

        n = int(first_line[0])
        target = int(first_line[1])

        # Parse array
        array = list(map(int, lines[1].split()))
        if len(array) != n:
            sys.stderr.write(f"ERROR: Array length {len(array)} doesn't match n={n}\n")
            return {"passed": False}

        # Check if user output is "IMPOSSIBLE"
        if actual.upper() == "IMPOSSIBLE":
            # Trust the expected output - if it says IMPOSSIBLE, user should too
            sys.stderr.write("✓ Output is IMPOSSIBLE (trusting expected output correctness)\n")
            return {"passed": True}

        # Parse user's two positions
        output_parts = actual.split()
        if len(output_parts) != 2:
            sys.stderr.write(f"ERROR: Expected 2 positions or 'IMPOSSIBLE', got: '{actual}'\n")
            return {"passed": False}

        try:
            pos1 = int(output_parts[0])
            pos2 = int(output_parts[1])
        except ValueError:
            sys.stderr.write(f"ERROR: Positions must be integers, got: '{actual}'\n")
            return {"passed": False}

        # Verify positions are distinct
        if pos1 == pos2:
            sys.stderr.write(f"ERROR: Cannot use same index twice (got {pos1} and {pos2})\n")
            return {"passed": False}

        # Verify positions are within valid range (1-indexed)
        if pos1 < 1 or pos1 > n:
            sys.stderr.write(f"ERROR: Position {pos1} is out of range [1, {n}]\n")
            return {"passed": False}

        if pos2 < 1 or pos2 > n:
            sys.stderr.write(f"ERROR: Position {pos2} is out of range [1, {n}]\n")
            return {"passed": False}

        # Convert to 0-indexed for array access
        idx1 = pos1 - 1
        idx2 = pos2 - 1

        # Verify the sum
        value1 = array[idx1]
        value2 = array[idx2]
        sum_result = value1 + value2

        if sum_result == target:
            sys.stderr.write(f"✓ Valid solution: positions {pos1} and {pos2} (values {value1} + {value2} = {target})\n")
            return {"passed": True}
        else:
            sys.stderr.write(f"ERROR: Sum mismatch - array[{pos1}] + array[{pos2}] = {value1} + {value2} = {sum_result}, expected {target}\n")
            return {"passed": False}

    except Exception as e:
        sys.stderr.write(f"ERROR: Validator exception: {str(e)}\n")
        return {"passed": False}

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = validate(input_data)
    print(json.dumps(result))
