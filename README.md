# Coding Platform

A robust, full-featured coding challenge platform built in Go with secure code execution, user authentication, problem management, and role-based access control. Perfect for building competitive programming platforms, online judges, or educational coding systems.

## 🎯 Features

### Code Execution
- **Asynchronous Processing**: RabbitMQ-based queue system for scalable code execution
- **Real-time Status Updates**: Frontend polls submission status every 1.5 seconds
- **Multi-language Support**: Extensible architecture supports multiple programming languages (currently Python)
- **Resource Limits**: Enforces time limits (milliseconds) and memory limits (MB)
- **Docker Sandboxing**: Isolated, secure execution environment with no network access
- **Test Case Evaluation**: Automatically compares output against expected results
- **Detailed Results**: Returns execution time, memory usage, and error messages for each test case
- **Submission Tracking**: Database-backed submission history with status tracking

### Platform Features
- **User Authentication**: Multi-provider authentication system (email/password, OAuth ready)
- **Role-Based Access Control**: Four roles (admin, user, author, guest) with flexible permission management
- **Problem Management**: Create, edit, and manage coding problems with difficulty levels
- **Approval Workflow**: Problem review system with statuses (pending, approved, rejected, requested changes)
- **Tagging System**: Categorize problems with custom tags
- **Statistics Tracking**: Track submissions and acceptance rates per problem
- **Email Notifications**: SMTP-based email service for notifications and communication
- **Keyboard Shortcuts**: Platform-aware shortcuts (Cmd/Ctrl) for faster navigation

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
- RabbitMQ (for asynchronous code execution queue)
  - Install: https://www.rabbitmq.com/download.html
  - Or run with Docker: `docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
  - Management UI: http://localhost:15672 (guest/guest)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd coding_platform

# Install backend dependencies
cd backend
go mod download

# Set up environment variables
cp .env.example .env
# Edit .env and configure:
# - DATABASE_URL (PostgreSQL connection string)
# - RABBITMQ_URL (RabbitMQ connection string)
# - SMTP settings (for email service)
# - JWT secrets

# Run database migrations
goose -dir db/migrations postgres "your_postgres_connection_string" up

# Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL=http://localhost:4000/api
```

### Run the Application

**Start RabbitMQ** (if not already running):
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
# Management UI: http://localhost:15672 (guest/guest)
```

**Start the Backend Services:**
```bash
# Terminal 1: Run API Server
cd backend
go run cmd/server/main.go

# Terminal 2: Run Worker (RabbitMQ Consumer)
cd backend
go run cmd/worker/main.go
# Worker continuously listens for submission messages and executes code
```

**Start the Frontend:**
```bash
# Terminal 3: Run Frontend Dev Server
cd frontend
npm run dev
# Navigate to http://localhost:5173
```

**Optional: Pre-build Docker images:**
```bash
# Python executor image (auto-builds on first use if not present)
cd backend
docker build -t python-executor -f dockerfiles/python.Dockerfile dockerfiles/
```

## 🏗️ Architecture

The system uses **asynchronous processing with RabbitMQ** and **Docker sandboxing**:

```
┌─────────────────┐
│   Frontend      │  User submits code
│  (React + TS)   │
└────────┬────────┘
         │ POST /api/submissions
         ▼
┌─────────────────┐
│   API Server    │  1. Save to Database (status: pending)
│   (Go + Chi)    │  2. Send to RabbitMQ Queue
└────────┬────────┘  3. Return submission_id
         │
         │ Frontend polls every 1.5s
         │ GET /api/submissions/status/{id}
         │
         ▼
┌─────────────────┐
│   Database      │  Tracks submission status
│  (PostgreSQL)   │  & execution results
└─────────────────┘
         ▲
         │
         │ Worker updates status
         │
┌─────────────────┐
│  RabbitMQ Queue │  Message broker
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Worker      │  1. Consume from queue
│                 │  2. Update status: running
└────────┬────────┘  3. Execute code
         │           4. Save results
         ▼
┌─────────────────┐
│    Executor     │  Orchestrates test execution
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Language Runner │  Python, Java, C++, etc.
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Docker Container       │  Isolated, secure execution
│  - No network access    │
│  - Resource limits      │
│  - Non-root user        │
└─────────────────────────┘
```

### Key Components

1. **API Server** (`cmd/server/`): Chi router-based HTTP server handling submissions and status queries
2. **Queue Services** (`internal/services/queue/`): RabbitMQ sender and receiver for async processing
3. **Models** (`internal/models/`): Data structures for submissions, test cases, and results
4. **Executor** (`internal/executor/`): Core execution engine that runs code and evaluates results
5. **Language Runners**: Language-specific implementations (PythonRunner, JavaRunner, etc.)
6. **Worker** (`cmd/worker/`): Background service that consumes from RabbitMQ queue and executes code
7. **Database** (`db/migrations/`): PostgreSQL schema with users, authentication, roles, problems, submissions, and tags
8. **Mail Service** (`internal/services/mailService.go`): SMTP-based email notifications

## 🔧 How It Works

### Execution Flow

**Asynchronous Submission Processing:**

1. **User Submits Code**: Frontend sends code to `POST /api/submissions`
2. **API Server**:
   - Creates submission record in database (status: `pending`)
   - Sends message to RabbitMQ queue
   - Returns `submission_id` to frontend immediately
3. **Frontend Polling**: Uses `useSubmissionPolling` hook to poll `/api/submissions/status/{id}` every 1.5 seconds
4. **Worker Consumes Message**:
   - Picks up message from RabbitMQ queue
   - Updates submission status to `running`
   - Initializes executor with language runners
   - Ensures Docker image exists (auto-build if needed)
5. **For Each Test Case**:
   - Create temporary directory on host
   - Write code to file (e.g., `solution.py`)
   - Generate unique container name
   - Launch Docker container with resource limits
   - Run code with test input via stdin
   - Capture stdout and stderr
   - On timeout: explicitly kill container
   - Compare output with expected result
   - Clean up temporary files
6. **Update Database**:
   - Save final status (`accepted`, `wrong_answer`, `time_limit_exceeded`, etc.)
   - Record execution metrics (runtime, memory usage)
   - Store test case results
7. **Frontend Receives Results**: Next poll receives final status and stops polling

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

### Submitting Code for Execution

**Via Web UI (Recommended):**
1. Navigate to http://localhost:5173 in your browser
2. Select a problem from the problems list
3. Write your solution in the Monaco code editor
4. Click "Run" to test with sample test cases
5. Click "Submit" to run against all hidden test cases
6. Watch real-time status updates as your code executes

**Via API:**
```bash
# Submit code for execution
curl -X POST http://localhost:4000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "problem_id": "problem-uuid",
    "code": "def solution(n):\n    return n * 2",
    "language": "python",
    "type": "submit"
  }'

# Response
{
  "submission_id": "uuid",
  "status": "pending"
}

# Poll for results
curl http://localhost:4000/api/submissions/status/{submission_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Structure

When polling returns final status, you'll receive:

```json
{
  "id": "uuid",
  "status": "accepted",
  "runtime_ms": 45,
  "memory_used_mb": 2.5,
  "test_cases_passed": 10,
  "test_cases_total": 10,
  "error_message": null,
  "submitted_at": "2025-10-26T10:30:00Z",
  "completed_at": "2025-10-26T10:30:02Z"
}
```

**Possible status values:**
- `pending` - Waiting in queue
- `running` - Currently executing
- `accepted` - All test cases passed
- `wrong_answer` - Output doesn't match expected
- `time_limit_exceeded` - Execution took too long
- `memory_limit_exceeded` - Used too much memory
- `runtime_error` - Code crashed during execution
- `compilation_error` - Code failed to compile

### Worker Logs

The worker outputs execution details to the console:
- Submission ID being processed
- Execution progress for each test case
- Final status and metrics
- Any errors encountered

Monitor worker logs to see real-time code execution activity.

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

Test the new language through the web UI or API:
- Select "Java" from the language dropdown in the editor
- Write Java code and submit
- Or use the API with `"language": "java"` in the request body

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

- [x] ~~Integration with message queues (RabbitMQ)~~ ✅ Completed
- [x] ~~Web UI for submitting code~~ ✅ Completed (React frontend)
- [x] ~~User submission history~~ ✅ Completed (submissions table)
- [ ] Add more languages (Java, C++, JavaScript, Rust, etc.)
- [ ] Distributed execution across multiple workers
- [ ] Rate limiting and queue management
- [ ] Compilation caching for compiled languages
- [ ] Memory usage tracking within containers
- [ ] Contest system and leaderboards
- [ ] Problem difficulty rating and recommendation system
- [ ] Admin panel for problem management
- [ ] WebSocket support for real-time updates (replace polling)

## 📝 License

This project is intended for educational purposes.

## 🤝 Contributing

Contributions are welcome! This codebase is designed to be beginner-friendly with extensive documentation.

## ❓ Questions?

The code is heavily commented to help Go beginners understand how everything works. Start reading from:
1. `cmd/worker/main.go` - Entry point
2. `internal/executor/executor.go` - Core logic
3. `internal/executor/python_runner.go` - Docker execution and security
