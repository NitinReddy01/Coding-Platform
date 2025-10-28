package models

type TestCaseResult struct {
	Passed         bool   `json:"passed"`
	Input          string `json:"input"`
	ExpectedOutput string `json:"expected_output"`
	ActualOutput   string `json:"actual_output"`
	ExecutionTime  int64  `json:"execution_time"`
	MemoryUsed     int64  `json:"memory_used"`
	Error          string `json:"error,omitempty"`
}

type ExecutionResult struct {
	Success        bool             `json:"success"`
	TestResults    []TestCaseResult `json:"test_results"`
	TotalPassed    int              `json:"total_passed"`
	TotalTests     int              `json:"total_tests"`
	CompileError   string           `json:"compile_error,omitempty"`
	RuntimeError   string           `json:"runtime_error,omitempty"`
	MaxExecutionMs int64            `json:"max_execution_ms"`
	MaxMemoryKB    int64            `json:"max_memory_kb"`
}
