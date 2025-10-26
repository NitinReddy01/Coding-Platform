package executor

import (
	"strings"
	"time"
)

// timeLimitToDuration converts milliseconds to time.Duration.
func timeLimitToDuration(timeLimit int) time.Duration {
	return time.Duration(timeLimit) * time.Millisecond
}

// normalizeOutput removes leading/trailing whitespace and normalizes line endings.
func normalizeOutput(output string) string {
	output = strings.TrimSpace(output)
	output = strings.ReplaceAll(output, "\r\n", "\n")
	return output
}
