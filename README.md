# Coding Platform - Code Execution Worker

A robust, scalable code execution system built in Go that runs user-submitted code against test cases with time and memory limits. Perfect for building coding challenge platforms, online judges, or automated code testing systems.

## 🎯 Features

- **Multi-language Support**: Extensible architecture supports multiple programming languages (currently Python)
- **Resource Limits**: Enforces time limits (milliseconds) and memory limits (MB)
- **Sandboxed Execution**: Runs code in isolated temporary directories
- **Test Case Evaluation**: Automatically compares output against expected results
- **Detailed Results**: Returns execution time, memory usage, and error messages for each test case
- **Beginner-Friendly**: Extensively documented code with explanations of Go concepts

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Adding New Languages](#adding-new-languages)
- [Go Concepts Used](#go-concepts-used)
- [Project Structure](#project-structure)

## 🚀 Quick Start

### Prerequisites

- Go 1.24.5 or later
- Python 3 (for running Python submissions)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd coding_platform

# Install dependencies
go mod download
```

### Run the Worker

```bash
# Run with a submission file
go run cmd/worker/main.go test_worker.json
```

### Example Submission File

Create a file `test_worker.json`:

```json
{
  "code": "n = int(input())\nprint(n * 2)",
  "language": "python",
  "time_limit": 2000,
  "memory_limit": 128,
  "test_cases": [
    {
      "input": "5",
      "expected_output": "10"
    },
    {
      "input": "10",
      "expected_output": "20"
    }
  ]
}
```

## 🏗️ Architecture

The system uses a clean, modular architecture:

```
┌─────────────┐
│   Worker    │  (CLI tool that reads submissions)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Executor   │  (Orchestrates test execution)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Language Runners │  (Python, Java, C++, etc.)
└──────────────────┘
```

### Key Components

1. **Models** (`internal/models/`): Data structures for submissions, test cases, and results
2. **Executor** (`internal/executor/`): Core execution engine that runs code and evaluates results
3. **Language Runners**: Language-specific implementations (PythonRunner, JavaRunner, etc.)
4. **Worker** (`cmd/worker/`): CLI tool to run submissions (can be adapted for queues/HTTP)

## 🔧 How It Works

### Execution Flow

1. **Read Submission**: Parse JSON file containing code, language, and test cases
2. **Initialize Executor**: Create executor and register language runners
3. **For Each Test Case**:
   - Create temporary isolated directory
   - Write code to a file (e.g., `solution.py`)
   - Run code with test input via stdin
   - Monitor execution time and memory usage
   - Capture stdout and stderr
   - Compare output with expected result
   - Clean up temporary files
4. **Return Results**: Aggregate all test results and metrics

### Resource Monitoring

- **Time Limits**: Uses Go's `context.WithTimeout` to cancel long-running processes
- **Memory Limits**: Runs a goroutine that polls memory usage every 10ms using system calls
- **Isolation**: Each execution runs in a unique temporary directory

### Output Comparison

- Normalizes whitespace and line endings
- Compares actual output vs expected output
- Returns detailed error messages for mismatches

## 📖 Usage

### Running a Submission

```bash
go run cmd/worker/main.go <path-to-submission.json>
```

### Output

The worker prints:
- Execution summary (passed/total tests)
- Per-test-case results
- Time and memory metrics
- A `result.json` file with detailed JSON output

### Result Structure

```json
{
  "success": true,
  "test_results": [
    {
      "passed": true,
      "input": "5",
      "expected_output": "10",
      "actual_output": "10",
      "execution_time": 45,
      "memory_used": 2048,
      "error": ""
    }
  ],
  "total_passed": 3,
  "total_tests": 3,
  "max_execution_ms": 120,
  "max_memory_kb": 4096
}
```

## 🔨 Adding New Languages

The system is designed for easy language support extension.

### Step 1: Create a New Runner

Create a file `internal/executor/java_runner.go`:

```go
package executor

import (
    "context"
    "os/exec"
    // ... other imports
)

type JavaRunner struct {
    workDir    string
    memLimitMB int
}

func NewJavaRunner(workDir string, memLimitMB int) *JavaRunner {
    return &JavaRunner{
        workDir:    workDir,
        memLimitMB: memLimitMB,
    }
}

// Implement LanguageRunner interface
func (r *JavaRunner) GetLanguageName() string {
    return "java"
}

func (r *JavaRunner) Execute(ctx context.Context, code string, input string) (*ExecutionOutput, error) {
    // 1. Write code to Main.java
    // 2. Compile: javac Main.java
    // 3. Run: java Main
    // 4. Monitor resources
    // 5. Return output
}
```

### Step 2: Register the Runner

In `cmd/worker/main.go`:

```go
// Register Java runner
javaRunner := executor.NewJavaRunner(workDir, submission.MemLimit)
exec.RegisterRunner(javaRunner)
```

### Step 3: Test

```json
{
  "code": "import java.util.Scanner; ...",
  "language": "java",
  ...
}
```

## 📚 Go Concepts Used

This project demonstrates many core Go concepts:

### Interfaces
```go
type LanguageRunner interface {
    Execute(ctx context.Context, code string, input string) (*ExecutionOutput, error)
    GetLanguageName() string
}
```
Any type that implements these methods automatically satisfies the interface.

### Goroutines & Channels
```go
monitorDone := make(chan struct{})
go func() {
    maxMemory, memExceeded = monitor.MonitorProcess(ctx, cmd)
    close(monitorDone)
}()
<-monitorDone  // Wait for goroutine to finish
```
Goroutines are lightweight threads. Channels enable communication between them.

### Context
```go
ctx, cancel := context.WithTimeout(context.Background(), duration)
defer cancel()
```
Contexts handle timeouts and cancellation across function boundaries.

### Structs & Methods
```go
type PythonRunner struct {
    workDir string
}

func (r *PythonRunner) Execute(...) {...}
```
Structs group data. Methods are functions with a receiver.

### Error Handling
```go
if err != nil {
    return nil, fmt.Errorf("failed: %w", err)
}
```
Go uses explicit error returns instead of exceptions.

### Defer
```go
defer os.RemoveAll(tempDir)
```
`defer` runs a function when the current function returns (like finally).

### Slices & Maps
```go
testResults := make([]TestCaseResult, 0, capacity)  // Slice
runners := make(map[string]LanguageRunner)         // Map
```

## 📁 Project Structure

```
coding_platform/
├── cmd/
│   ├── server/          # API server (future)
│   └── worker/          # Code execution worker (current)
│       └── main.go      # CLI entry point
├── internal/
│   ├── models/          # Data structures
│   │   ├── testcase.go
│   │   ├── submission.go
│   │   └── result.go
│   ├── executor/        # Execution engine
│   │   ├── executor.go         # Core orchestration
│   │   ├── python_runner.go    # Python implementation
│   │   ├── resource_monitor.go # Memory/time tracking
│   │   └── utils.go            # Helper functions
│   ├── config/          # Configuration
│   │   └── config.go
│   └── routes/          # HTTP routes (for future API)
├── go.mod
├── go.sum
├── .env
├── CLAUDE.md            # AI assistant guidance
└── README.md            # This file
```

## 🎓 Learning Resources

If you're new to Go, here are the key concepts to understand:

1. **Packages**: Go code is organized into packages (like modules in other languages)
2. **Interfaces**: Define behavior without implementation
3. **Goroutines**: Lightweight concurrent execution
4. **Channels**: Communication between goroutines
5. **Error Handling**: Explicit error returns, not exceptions
6. **Pointers**: `*Type` is a pointer, `&value` gets address
7. **Defer**: Cleanup code that runs when function exits

## 🔮 Future Enhancements

- [ ] Add more languages (Java, C++, JavaScript, etc.)
- [ ] Integration with message queues (RabbitMQ, Redis)
- [ ] Docker-based sandboxing for better isolation
- [ ] Distributed execution across multiple workers
- [ ] Web UI for submitting code
- [ ] Database integration for storing results
- [ ] Rate limiting and queue management

## 📝 License

This project is intended for educational purposes.

## 🤝 Contributing

Contributions are welcome! This codebase is designed to be beginner-friendly with extensive documentation.

## ❓ Questions?

The code is heavily commented to help Go beginners understand how everything works. Start reading from:
1. `cmd/worker/main.go` - Entry point
2. `internal/executor/executor.go` - Core logic
3. `internal/executor/python_runner.go` - Execution details
