package executor

import (
	"strings"
	"time"
)

// timeLimitToDuration converts a time limit in milliseconds to a time.Duration.
//
// WHAT IS time.Duration?
// time.Duration is Go's way of representing a length of time (like 5 seconds, 100ms, etc.)
// It's actually just an int64 representing nanoseconds, but with helpful methods.
//
// WHY THIS FUNCTION?
// We store time limits as simple integers (milliseconds) for easy JSON serialization,
// but Go's context and time functions need time.Duration, so we convert.
//
// Example:
//
//	duration := timeLimitToDuration(2000)  // 2000ms = 2 seconds
func timeLimitToDuration(timeLimit int) time.Duration {
	// time.Duration(timeLimit) converts int to Duration (treating it as nanoseconds)
	// Multiplying by time.Millisecond converts it to the right unit
	// Example: 2000 * time.Millisecond = 2 seconds
	return time.Duration(timeLimit) * time.Millisecond
}

// normalizeOutput cleans up output strings for fair comparison.
// This removes differences in whitespace/newlines that shouldn't affect correctness.
//
// WHY NORMALIZE?
// - Different OS use different line endings (\n vs \r\n)
// - Users might have extra trailing whitespace
// - We want to compare actual content, not formatting
//
// Example:
//
//	input:  "10  \n\n"
//	output: "10"
func normalizeOutput(output string) string {
	// strings.TrimSpace removes leading and trailing whitespace (spaces, tabs, newlines)
	// Example: "  hello  \n" becomes "hello"
	output = strings.TrimSpace(output)

	// strings.ReplaceAll replaces all occurrences of "\r\n" with "\n"
	// This normalizes Windows line endings (\r\n) to Unix line endings (\n)
	// Example: "line1\r\nline2\r\n" becomes "line1\nline2\n"
	output = strings.ReplaceAll(output, "\r\n", "\n")

	return output
}
