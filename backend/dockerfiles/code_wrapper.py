#!/usr/bin/env python3
"""
Multi-language code execution wrapper supporting multiple programming languages.
Handles compilation (if needed), execution against test cases, timeout/memory tracking.
"""

import json
import subprocess
import time
import sys
import signal
import traceback
import tracemalloc
from io import StringIO

# Language configuration
LANGUAGE_CONFIG = {
    'python': {
        'extension': '.py',
        'compile': None,  # Interpreted, no compilation
        'run_command': lambda file: ['python3', file],
        'supports_in_process': True,  # Can run in same Python process
    },
    'cpp': {
        'extension': '.cpp',
        'compile': lambda source, binary: ['g++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-o', binary, source],
        'run_command': lambda file: [file],
        'supports_in_process': False,  # Runs as subprocess
    },
    'javascript': {
        'extension': '.js',
        'compile': None,  # Interpreted, no compilation
        'run_command': lambda file: ['node', file],
        'supports_in_process': False,  # Runs as subprocess
    },
    'java': {
        'extension': '.java',
        'compile': lambda source, binary: ['javac', source],  # Creates .class file
        'run_command': lambda file: ['java', '-cp', '/workspace', 'Solution'],  # Assumes class name is Solution
        'supports_in_process': False,  # Runs as subprocess
    },
}


def get_source_filename(language):
    """
    Get the source filename for a language.
    Java requires capital 'Solution.java' for public class Solution.
    Other languages use lowercase 'solution.<ext>'.
    """
    if language == 'java':
        return '/workspace/Solution.java'
    else:
        lang_config = LANGUAGE_CONFIG[language]
        return f'/workspace/solution{lang_config["extension"]}'


def load_config():
    """Load execution configuration from JSON file."""
    with open('/workspace/config.json', 'r') as f:
        return json.load(f)


def load_test_cases():
    """Load test cases from JSON file."""
    with open('/workspace/test_cases.json', 'r') as f:
        return json.load(f)


def load_user_code():
    """Load user's source code."""
    config = load_config()
    lang = config['language']

    code_file = get_source_filename(lang)
    with open(code_file, 'r') as f:
        return f.read()


def compile_code(language):
    """Compile code if language requires it. Returns (success, error_message)."""
    lang_config = LANGUAGE_CONFIG[language]

    if lang_config['compile'] is None:
        return True, None

    source_file = get_source_filename(language)
    binary_file = '/workspace/solution'

    compile_cmd = lang_config['compile'](source_file, binary_file)

    result = subprocess.run(
        compile_cmd,
        capture_output=True,
        text=True,
        timeout=30  # Compilation timeout
    )

    if result.returncode != 0:
        return False, result.stderr

    return True, None


def execute_python_in_process(code, test_cases, time_limit_ms):
    """Execute Python code in-process for better performance and memory tracking."""
    # Compile user code once
    try:
        compiled_code = compile(code, '/workspace/solution.py', 'exec')
    except SyntaxError as e:
        # Return compilation error for all test cases
        return [{
            'stdout': '',
            'stderr': str(e),
            'exit_code': 1,
            'time_ms': 0,
            'memory_kb': 0,
            'timed_out': False,
            'memory_exceeded': False,
            'error': f'Compilation error: {str(e)}'
        } for _ in test_cases]

    results = []

    for tc in test_cases:
        result = {
            'stdout': '',
            'stderr': '',
            'exit_code': 0,
            'time_ms': 0,
            'memory_kb': 0,
            'timed_out': False,
            'memory_exceeded': False,
            'error': ''
        }

        # Redirect stdin
        old_stdin = sys.stdin
        sys.stdin = StringIO(tc['input'])

        # Capture stdout
        old_stdout = sys.stdout
        sys.stdout = StringIO()

        # Capture stderr
        old_stderr = sys.stderr
        sys.stderr = StringIO()

        # Timeout handler
        def timeout_handler(signum, frame):
            raise TimeoutError(f'Time limit exceeded ({time_limit_ms}ms)')

        # Start memory tracking
        tracemalloc.start()

        # Set timeout
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.setitimer(signal.ITIMER_REAL, time_limit_ms / 1000.0)

        # Start timing
        start_time = time.perf_counter()

        try:
            # Execute in fresh namespace
            exec(compiled_code, {'__name__': '__main__'})

        except TimeoutError:
            result['timed_out'] = True
            result['error'] = f'Time limit exceeded ({time_limit_ms}ms)'

        except Exception as e:
            result['exit_code'] = 1
            result['error'] = str(e)
            sys.stderr.write(traceback.format_exc())

        finally:
            # Cancel alarm
            signal.alarm(0)

            # End timing
            end_time = time.perf_counter()
            result['time_ms'] = int((end_time - start_time) * 1000)

            # Get memory usage
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            result['memory_kb'] = peak // 1024

            # Capture output
            result['stdout'] = sys.stdout.getvalue()
            result['stderr'] = sys.stderr.getvalue()

            # Restore stdin/stdout/stderr
            sys.stdin = old_stdin
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        results.append(result)

    return results


def execute_subprocess(language, test_cases, time_limit_ms):
    """Execute compiled/interpreted code as subprocess for each test case."""
    lang_config = LANGUAGE_CONFIG[language]

    if language == 'cpp':
        run_cmd = lang_config['run_command']('/workspace/solution')
    elif language == 'javascript':
        run_cmd = lang_config['run_command'](get_source_filename(language))
    elif language == 'java':
        run_cmd = lang_config['run_command'](None)  # Uses class name
    else:
        raise ValueError(f'Unsupported subprocess language: {language}')

    # Debug: Print command being executed
    print(f"DEBUG [{language}]: Executing command: {' '.join(run_cmd)}", file=sys.stderr)

    results = []

    for tc in test_cases:
        result = {
            'stdout': '',
            'stderr': '',
            'exit_code': 0,
            'time_ms': 0,
            'memory_kb': 0,
            'timed_out': False,
            'memory_exceeded': False,
            'error': ''
        }

        try:
            start_time = time.perf_counter()

            proc = subprocess.run(
                run_cmd,
                input=tc['input'],
                capture_output=True,
                text=True,
                timeout=time_limit_ms / 1000.0
            )

            end_time = time.perf_counter()

            result['stdout'] = proc.stdout
            result['stderr'] = proc.stderr
            result['exit_code'] = proc.returncode
            result['time_ms'] = int((end_time - start_time) * 1000)

            # Memory tracking for subprocess is complex, placeholder for now
            result['memory_kb'] = 0

            if proc.returncode != 0:
                # Include stderr in error for better debugging
                error_msg = 'Runtime error'
                if proc.stderr:
                    error_msg = f'Runtime error: {proc.stderr.strip()}'
                result['error'] = error_msg

        except subprocess.TimeoutExpired:
            result['timed_out'] = True
            result['error'] = f'Time limit exceeded ({time_limit_ms}ms)'

        except Exception as e:
            result['exit_code'] = 1
            result['error'] = str(e)

        results.append(result)

    return results


def main():
    """Main execution flow."""
    config = load_config()
    language = config['language']
    time_limit_ms = config['time_limit_ms']

    if language not in LANGUAGE_CONFIG:
        print(f"Unsupported language: {language}", file=sys.stderr)
        sys.exit(1)

    test_cases = load_test_cases()

    # Compile if needed
    compile_success, compile_error = compile_code(language)

    if not compile_success:
        # Compilation failed - return error for all test cases
        results = [{
            'stdout': '',
            'stderr': compile_error,
            'exit_code': 1,
            'time_ms': 0,
            'memory_kb': 0,
            'timed_out': False,
            'memory_exceeded': False,
            'error': 'Compilation error'
        } for _ in test_cases]
    else:
        # Execute test cases
        lang_config = LANGUAGE_CONFIG[language]

        if lang_config['supports_in_process']:
            user_code = load_user_code()
            results = execute_python_in_process(user_code, test_cases, time_limit_ms)
        else:
            results = execute_subprocess(language, test_cases, time_limit_ms)

    # Write results to file
    with open('/workspace/results.json', 'w') as f:
        json.dump(results, f)


if __name__ == '__main__':
    main()
