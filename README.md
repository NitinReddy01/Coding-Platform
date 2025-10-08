# Coding Platform

A robust, full-featured coding challenge platform built in Go with secure code execution, user authentication, problem management, and role-based access control. Perfect for building competitive programming platforms, online judges, or educational coding systems.

## 🎯 Features

### Code Execution
- **Multi-language Support**: Extensible architecture supports multiple programming languages (currently Python)
- **Resource Limits**: Enforces time limits (milliseconds) and memory limits (MB)
- **Docker Sandboxing**: Isolated, secure execution environment with no network access
- **Test Case Evaluation**: Automatically compares output against expected results
- **Detailed Results**: Returns execution time, memory usage, and error messages for each test case

### Platform Features
- **User Authentication**: Multi-provider authentication system (email/password, OAuth ready)
- **Role-Based Access Control**: Four roles (admin, user, author, guest) with flexible permission management
- **Problem Management**: Create, edit, and manage coding problems with difficulty levels
- **Approval Workflow**: Problem review system with statuses (pending, approved, rejected, requested changes)
- **Tagging System**: Categorize problems with custom tags
- **Statistics Tracking**: Track submissions and acceptance rates per problem

### Developer Experience
- **Beginner-Friendly**: Extensively documented code with explanations of Go concepts
- **Database Migrations**: Version-controlled schema with goose
- **Modular Architecture**: Clean separation of concerns with interface-based design

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
- Docker (for secure sandboxed execution)
  - Install: https://docs.docker.com/get-docker/
  - Ensure Docker daemon is running
- PostgreSQL 12 or later
  - Install: https://www.postgresql.org/download/
  - Create a database for the application

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd coding_platform

# Install dependencies
go mod download

# Set up environment variables
cp .env.example .env  # Create .env file and configure DATABASE_URL

# Run database migrations
goose -dir db/migrations postgres "your_postgres_connection_string" up
```

### Run the Worker

```bash
# Run with a submission file
# Docker image builds automatically on first run
go run cmd/worker/main.go test_worker.json

# Optional: Pre-build the Docker image manually
docker build -t python-executor -f dockerfiles/python.Dockerfile dockerfiles/
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

The system uses Docker sandboxing with a clean, modular architecture:

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
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Docker Containers    │  (Isolated, secure execution)
│ - No network access  │
│ - Resource limits    │
│ - Non-root user      │
└──────────────────────┘
```

### Key Components

1. **Models** (`internal/models/`): Data structures for submissions, test cases, and results
2. **Executor** (`internal/executor/`): Core execution engine that runs code and evaluates results
3. **Language Runners**: Language-specific implementations (PythonRunner, JavaRunner, etc.)
4. **Worker** (`cmd/worker/`): CLI tool to run submissions (can be adapted for queues/HTTP)
5. **Database** (`db/migrations/`): PostgreSQL schema with users, authentication, roles, problems, and tags

## 🔧 How It Works

### Execution Flow

1. **Read Submission**: Parse JSON file containing code, language, and test cases
2. **Initialize Executor**: Auto-register all supported language runners
3. **Ensure Docker Image**: Check if image exists, build automatically if needed (one-time)
4. **For Each Test Case**:
   - Create temporary directory on host
   - Write code to a file (e.g., `solution.py`)
   - Generate unique container name
   - Launch Docker container with resource limits
   - Run code with test input via stdin
   - Capture stdout and stderr
   - On timeout: explicitly kill container
   - Compare output with expected result
   - Clean up temporary files
5. **Return Results**: Aggregate all test results and metrics

### Resource Monitoring & Security

- **Time Limits**: Uses Go's `context.WithTimeout` to cancel long-running containers
- **Memory Limits**: Enforced by Docker's cgroup limits (`--memory`)
- **CPU Limits**: Limited to 0.5 cores per container (`--cpus`)
- **Network Isolation**: No network access (`--network none`)
- **Process Limits**: Max 50 processes to prevent fork bombs (`--pids-limit`)
- **User Isolation**: Code runs as non-root user inside container
- **Container Cleanup**: Automatic removal after execution (`--rm`)

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

### Step 1: Create a Dockerfile

Create `dockerfiles/java.Dockerfile`:

```dockerfile
FROM openjdk:17-alpine
RUN adduser -D -u 1000 coderunner
RUN mkdir /workspace && chown coderunner:coderunner /workspace
USER coderunner
WORKDIR /workspace
CMD ["java"]
```

### Step 2: Create a New Runner

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
    // Follow pattern from python_runner.go:
    // 1. Ensure Docker image exists (auto-build)
    // 2. Create temp directory
    // 3. Write code to Main.java
    // 4. Compile if needed (can be in Dockerfile ENTRYPOINT)
    // 5. Run Docker container with java-executor image
    // 6. Return output
}
```

### Step 3: Register in Executor

In `internal/executor/executor.go` `NewExecutor()` function:

```go
javaRunner := NewJavaRunner(workDir, memLimitMB)
runners[javaRunner.GetLanguageName()] = javaRunner
```

### Step 4: Test

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

### Docker Integration
```go
dockerArgs := []string{
    "run", "--rm", "-i",
    "--network", "none",
    "--memory", memoryLimit,
    "--cpus", "0.5",
    // ... more security flags
}
cmd := exec.CommandContext(ctx, "docker", dockerArgs...)
```
Docker provides isolated containers with resource limits and security restrictions.

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
│   ├── server/          # API server
│   │   └── main.go      # HTTP server entry point
│   └── worker/          # Code execution worker
│       └── main.go      # CLI entry point
├── db/
│   └── migrations/      # Database schema migrations (goose)
│       ├── 20251008050025_users_table.sql
│       ├── 20251008052918_auth_table.sql
│       ├── 20251008063249_roles_table.sql
│       ├── 20251008072927_seed_roles.sql
│       └── 20251008092839_problems_table.sql
├── dockerfiles/         # Docker images for sandboxing
│   └── python.Dockerfile
├── internal/
│   ├── models/          # Data structures
│   │   ├── testcase.go
│   │   ├── submission.go
│   │   └── result.go
│   ├── executor/        # Execution engine
│   │   ├── executor.go         # Core orchestration
│   │   ├── python_runner.go    # Python implementation
│   │   └── utils.go            # Helper functions
│   ├── config/          # Configuration
│   │   └── config.go
│   └── routes/          # HTTP routes
│       ├── main.go      # Route aggregation
│       └── auth.go      # Authentication routes
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
- [ ] Distributed execution across multiple workers
- [ ] Web UI for submitting code
- [ ] Rate limiting and queue management
- [ ] Compilation caching for compiled languages
- [ ] Memory usage tracking within containers
- [ ] User submission history and leaderboards
- [ ] Problem difficulty rating and recommendation system

## 📝 License

This project is intended for educational purposes.

## 🤝 Contributing

Contributions are welcome! This codebase is designed to be beginner-friendly with extensive documentation.

## ❓ Questions?

The code is heavily commented to help Go beginners understand how everything works. Start reading from:
1. `cmd/worker/main.go` - Entry point
2. `internal/executor/executor.go` - Core logic
3. `internal/executor/python_runner.go` - Docker execution and security
