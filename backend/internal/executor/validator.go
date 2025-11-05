package executor

import (
	"context"
)

// OutputValidator defines the interface for validating test case outputs
type OutputValidator interface {
	// Validate checks if the actual output matches the expected output
	// Returns: passed (bool), error (if validation itself failed)
	Validate(ctx context.Context, input, expected, actual string) (bool, error)
}
