// Package main is the entry point for the code execution worker.
//
// WHAT IS THIS WORKER?
// This is a command-line tool that executes user-submitted code against test cases.
// It's designed to be run standalone, but in production you could integrate it with:
// - Message queues (RabbitMQ, Redis, etc.)
// - HTTP endpoints
// - gRPC services
//
// HOW TO RUN:
//
//	go run cmd/worker/main.go test_worker.json
//
// The JSON file should contain: code, language, test_cases, time_limit, memory_limit
package main

import (
	"app/internal/executor"
	"app/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func main() {
	// Check command-line arguments
	// os.Args is a slice containing all command-line arguments
	// os.Args[0] is the program name, os.Args[1] is the first argument
	// len() returns the length of a slice
	if len(os.Args) < 2 {
		// log.Fatal prints the message and exits the program with status 1
		log.Fatal("Usage: go run cmd/worker/main.go <submission.json>")
	}

	// Get the submission file path from command-line arguments
	submissionFile := os.Args[1]

	// Read the JSON file containing the submission
	// os.ReadFile reads the entire file into memory as a byte slice
	data, err := os.ReadFile(submissionFile)
	if err != nil {
		// log.Fatalf is like fmt.Printf + log.Fatal (print and exit)
		// %v is a placeholder that prints the error in a default format
		log.Fatalf("Failed to read submission file: %v", err)
	}

	// Parse the JSON data into a Submission struct
	// WHAT IS UNMARSHALING?
	// Unmarshaling is converting JSON text into Go structs
	// It's the opposite of marshaling (struct to JSON)
	var submission models.Submission
	err = json.Unmarshal(data, &submission)
	if err != nil {
		log.Fatalf("Failed to parse submission: %v", err)
	}

	// Set default limits if they weren't provided in the JSON
	// This makes the API more user-friendly - users don't have to specify everything
	if submission.TimeLimit == 0 {
		submission.TimeLimit = 5000 // 5 seconds (5000 milliseconds)
	}
	if submission.MemLimit == 0 {
		submission.MemLimit = 256 // 256 megabytes
	}

	// Create a work directory for code execution
	// os.TempDir() returns the system's temp directory (e.g., /tmp on Unix)
	// filepath.Join creates a path like "/tmp/code-executor"
	workDir := filepath.Join(os.TempDir(), "code-executor")

	// os.MkdirAll creates the directory and any necessary parent directories
	// 0755 is the permission: owner can read/write/execute, others can read/execute
	// It's like mkdir -p in bash
	err = os.MkdirAll(workDir, 0755)
	if err != nil {
		log.Fatalf("Failed to create work directory: %v", err)
	}

	// Initialize the executor
	// This creates the main component that will run the code
	exec := executor.NewExecutor()

	// Register a Python runner
	// This tells the executor how to run Python code
	// You can register multiple runners for different languages:
	//   exec.RegisterRunner(NewJavaRunner(...))
	//   exec.RegisterRunner(NewCppRunner(...))
	pythonRunner := executor.NewPythonRunner(workDir, submission.MemLimit)
	exec.RegisterRunner(pythonRunner)

	// Print execution details to the console
	// This gives the user feedback about what's happening
	fmt.Println("Executing submission...")
	fmt.Printf("Language: %s\n", submission.Language)
	fmt.Printf("Time Limit: %dms\n", submission.TimeLimit)
	fmt.Printf("Memory Limit: %dMB\n", submission.MemLimit)
	fmt.Printf("Test Cases: %d\n\n", len(submission.TestCases))

	// Execute the submission
	// The & operator creates a pointer to submission
	// We pass a pointer to avoid copying the entire struct (more efficient)
	result, err := exec.Execute(&submission)
	if err != nil {
		log.Fatalf("Execution failed: %v", err)
	}

	// Print summary results
	fmt.Println("=== EXECUTION RESULTS ===")
	fmt.Printf("Success: %v\n", result.Success)
	fmt.Printf("Tests Passed: %d/%d\n", result.TotalPassed, result.TotalTests)
	fmt.Printf("Max Execution Time: %dms\n", result.MaxExecutionMs)
	fmt.Printf("Max Memory Used: %dKB\n\n", result.MaxMemoryKB)

	// Print any compilation or runtime errors (if present)
	if result.CompileError != "" {
		fmt.Printf("Compile Error: %s\n", result.CompileError)
	}
	if result.RuntimeError != "" {
		fmt.Printf("Runtime Error: %s\n", result.RuntimeError)
	}

	// Print detailed results for each test case
	// range loops through a slice, returning index (i) and value (testResult)
	for i, testResult := range result.TestResults {
		fmt.Printf("\n--- Test Case %d ---\n", i+1) // i+1 because humans count from 1, not 0
		fmt.Printf("Input: %s\n", testResult.Input)
		fmt.Printf("Expected: %s\n", testResult.ExpectedOutput)
		fmt.Printf("Actual: %s\n", testResult.ActualOutput)
		fmt.Printf("Passed: %v\n", testResult.Passed)
		fmt.Printf("Time: %dms\n", testResult.ExecutionTime)
		fmt.Printf("Memory: %dKB\n", testResult.MemoryUsed)

		// Only print error if there is one
		if testResult.Error != "" {
			fmt.Printf("Error: %s\n", testResult.Error)
		}
	}

	// Export results to a JSON file
	// WHAT IS MARSHALING?
	// Marshaling converts Go structs into JSON text
	// MarshalIndent creates "pretty" JSON with indentation for readability
	// Parameters: data, prefix (empty), indent (two spaces)
	resultJSON, _ := json.MarshalIndent(result, "", "  ")

	// Write the JSON to a file
	outputFile := "result.json"
	err = os.WriteFile(outputFile, resultJSON, 0644)
	if err != nil {
		// log.Printf just prints, doesn't exit (unlike log.Fatalf)
		// This is a warning - we still completed the execution even if we can't save the file
		log.Printf("Warning: Failed to write result file: %v", err)
	} else {
		fmt.Printf("\nResults written to %s\n", outputFile)
	}
}
