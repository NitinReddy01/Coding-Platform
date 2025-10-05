# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Go-based coding platform with two main components:
1. **API Server**: HTTP backend using `net/http` with modular routing
2. **Code Execution Worker**: Standalone system for running user code against test cases with resource limits

## Development Commands

**Run the API server:**
```bash
go run cmd/server/main.go
```

**Run the code execution worker:**
```bash
go run cmd/worker/main.go test_worker.json
```

**Install dependencies:**
```bash
go mod download
```

**Update dependencies:**
```bash
go mod tidy
```

## Architecture

### Project Structure

The codebase follows the standard Go project layout:
- `cmd/server/` - API server entry point
- `cmd/worker/` - Code execution worker entry point (CLI tool)
- `internal/` - Private application code
  - `config/` - Configuration management (loads from `.env`)
  - `routes/` - HTTP route handlers organized by domain
  - `models/` - Data structures (Submission, TestCase, ExecutionResult)
  - `executor/` - Code execution engine with language runners

### API Server Routing Pattern

The application uses a **nested routing architecture** with `http.ServeMux`:

1. Main router (`cmd/server/main.go`) mounts all routes under `/api/` prefix
2. API router (`internal/routes/main.go`) handles common routes like `/health` and delegates to domain-specific sub-routers
3. Domain routers (e.g., `internal/routes/auth.go`) handle specific functionality

**Route path resolution:**
- To access the login endpoint: `POST /api/auth/login`
- Each router strips its prefix before delegating to sub-routers

### Code Execution Worker Architecture

The worker uses an **interface-based design** for multi-language support:

```
Worker (CLI) → Executor → LanguageRunner (interface)
                            ├── PythonRunner
                            ├── JavaRunner (future)
                            └── CppRunner (future)
```

**Key components:**

1. **Executor** (`internal/executor/executor.go`):
   - Orchestrates test execution
   - Manages language runners via a registry pattern
   - Evaluates results against expected output

2. **LanguageRunner Interface**:
   - Defines contract for language-specific execution
   - Implementations handle compilation, execution, and cleanup
   - Currently: `PythonRunner`

3. **Resource Monitoring** (`internal/executor/resource_monitor.go`):
   - Runs in a goroutine during code execution
   - Polls memory usage every 10ms using syscalls
   - Terminates processes that exceed limits

4. **Models** (`internal/models/`):
   - `Submission`: Input (code, language, test cases, limits)
   - `TestCase`: Input/expected output pairs
   - `ExecutionResult`: Output with metrics and pass/fail status

**Execution Flow:**
1. Parse JSON submission file
2. Create isolated temp directory
3. Write code to file (e.g., `solution.py`)
4. Start process with timeout context
5. Monitor resources in goroutine
6. Capture stdout/stderr
7. Compare output with expected
8. Cleanup and return results

### Configuration

Environment variables are loaded from `.env` file in the project root using `godotenv`. The config package (`internal/config/config.go`) validates and provides typed access to configuration values.

**Required environment variables:**
- `PORT` - Server port (defaults to 4000)

### Adding New Routes

To add a new route domain:
1. Create a new file in `internal/routes/` (e.g., `users.go`)
2. Define a function that returns `*http.ServeMux` with your routes
3. Register it in `internal/routes/main.go` using `http.StripPrefix`

### Adding New Language Support

To add support for a new programming language:

1. **Create a new runner** in `internal/executor/<language>_runner.go`:
   ```go
   type JavaRunner struct {
       workDir    string
       memLimitMB int
   }

   func (r *JavaRunner) GetLanguageName() string {
       return "java"
   }

   func (r *JavaRunner) Execute(ctx context.Context, code string, input string) (*ExecutionOutput, error) {
       // Implement compilation and execution
   }
   ```

2. **Register the runner** in `cmd/worker/main.go`:
   ```go
   javaRunner := executor.NewJavaRunner(workDir, submission.MemLimit)
   exec.RegisterRunner(javaRunner)
   ```

3. **Follow the pattern** from `python_runner.go`:
   - Create temp directory
   - Write code to file
   - Compile (if needed)
   - Execute with resource monitoring
   - Capture output
   - Cleanup

## Important Go Patterns Used

### Interface-Based Extensibility
The `LanguageRunner` interface allows adding new languages without modifying core logic. Any type implementing `Execute()` and `GetLanguageName()` automatically satisfies the interface.

### Goroutines for Concurrency
Resource monitoring runs concurrently with code execution using goroutines. Channels (`chan struct{}`) synchronize completion.

### Context for Timeouts
`context.WithTimeout` enforces time limits. The context is passed to `exec.CommandContext` so the OS process is automatically killed on timeout.

### Defer for Cleanup
`defer os.RemoveAll(tempDir)` ensures temp directories are always cleaned up, even if execution fails.

### Error Wrapping
`fmt.Errorf("failed: %w", err)` preserves error chains for debugging.

## Testing

Create test submission files in JSON format:
```json
{
  "code": "print(input())",
  "language": "python",
  "time_limit": 2000,
  "memory_limit": 128,
  "test_cases": [
    {"input": "hello", "expected_output": "hello"}
  ]
}
```

Run with: `go run cmd/worker/main.go <file.json>`

Results are printed to console and saved to `result.json`.
