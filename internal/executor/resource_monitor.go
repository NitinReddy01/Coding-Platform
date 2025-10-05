package executor

import (
	"context"
	"os/exec"
	"runtime"
	"syscall"
	"time"
)

// ResourceMonitor tracks resource usage (specifically memory) of a running process.
// It monitors the process periodically and can detect when memory limits are exceeded.
type ResourceMonitor struct {
	// memLimitKB is the memory limit in kilobytes
	// We store in KB because that's what the OS APIs use
	memLimitKB int64
}

// NewResourceMonitor creates a new resource monitor with the given memory limit.
//
// Parameters:
//   - memLimitMB: Memory limit in megabytes (e.g., 256 for 256MB)
//
// Example:
//
//	monitor := NewResourceMonitor(256) // 256MB limit
func NewResourceMonitor(memLimitMB int) *ResourceMonitor {
	return &ResourceMonitor{
		// Convert MB to KB by multiplying by 1024
		// Example: 256 MB = 256 * 1024 = 262144 KB
		memLimitKB: int64(memLimitMB) * 1024,
	}
}

// MonitorProcess continuously monitors a running process for resource usage.
// It checks memory usage every 10ms and returns when the process exits or limit is exceeded.
//
// This function is designed to run in a goroutine while the process executes.
//
// Parameters:
//   - ctx: Context for cancellation (if ctx is cancelled, monitoring stops)
//   - cmd: The command/process to monitor
//
// Returns:
//   - memoryKB: Maximum memory usage observed (in kilobytes)
//   - exceeded: true if memory limit was exceeded, false otherwise
//
// Example:
//
//	monitor := NewResourceMonitor(256)
//	go func() {
//	    maxMem, exceeded := monitor.MonitorProcess(ctx, cmd)
//	    fmt.Printf("Peak memory: %d KB, Exceeded: %v\n", maxMem, exceeded)
//	}()
func (rm *ResourceMonitor) MonitorProcess(ctx context.Context, cmd *exec.Cmd) (memoryKB int64, exceeded bool) {
	// If the process hasn't started yet, return immediately
	if cmd.Process == nil {
		return 0, false
	}

	// Create a ticker that fires every 10 milliseconds
	// WHAT IS A TICKER?
	// A ticker is like a recurring alarm - it sends a signal on a channel at regular intervals
	// We use it to check memory usage periodically without busy-waiting
	ticker := time.NewTicker(10 * time.Millisecond)

	// Ensure we stop the ticker when this function returns
	// This prevents a goroutine leak
	defer ticker.Stop()

	// Track the maximum memory we've seen
	var maxMemory int64

	// Infinite loop - we'll break out when process exits or limit exceeded
	for {
		// SELECT STATEMENT in Go
		// select is like a switch, but for channel operations
		// It waits for one of its cases to be ready, then executes that case
		select {
		// This case triggers when the context is cancelled
		case <-ctx.Done():
			// Context was cancelled (probably due to timeout)
			return maxMemory, false

		// This case triggers every 10ms when the ticker fires
		case <-ticker.C:
			// Check if the process has finished
			// ProcessState is nil while running, non-nil after exit
			if cmd.ProcessState != nil && cmd.ProcessState.Exited() {
				// Process is done, return the max memory we observed
				return maxMemory, false
			}

			// Get current memory usage for this process
			mem := getProcessMemory(cmd.Process.Pid)

			// Update max if this is higher than we've seen before
			if mem > maxMemory {
				maxMemory = mem
			}

			// Check if we've exceeded the memory limit
			if rm.memLimitKB > 0 && mem > rm.memLimitKB {
				// Memory limit exceeded! Return immediately
				return maxMemory, true
			}
		}
	}
}

// getProcessMemory returns the current memory usage in KB for a given process ID.
// This is platform-specific because different operating systems track memory differently.
//
// IMPORTANT: This is a simplified implementation. In production, you might want to use
// more sophisticated methods like reading /proc/<pid>/status on Linux.
//
// Parameters:
//   - pid: The process ID to check
//
// Returns:
//   - Memory usage in kilobytes (0 if unable to determine)
func getProcessMemory(pid int) int64 {
	// PLATFORM-SPECIFIC CODE
	// runtime.GOOS is a constant that tells us which OS we're running on
	// Common values: "darwin" (macOS), "linux", "windows"

	switch runtime.GOOS {
	case "darwin":
		// On macOS, use rusage to get resource usage stats
		// WHAT IS RUSAGE?
		// rusage is a system call that provides resource usage statistics
		var rusage syscall.Rusage

		// Get resource usage for this specific process
		// Note: This might not work correctly for child processes
		// A more robust implementation would read process info differently
		err := syscall.Getrusage(pid, &rusage)
		if err != nil {
			// If we can't get the info, return 0
			return 0
		}

		// MaxRSS is "Maximum Resident Set Size" - how much RAM the process used
		// On macOS, it's in bytes, so we divide by 1024 to get KB
		return rusage.Maxrss / 1024

	case "linux":
		// On Linux, also use rusage
		var rusage syscall.Rusage

		// RUSAGE_CHILDREN gets stats for child processes
		// This is what we want since we spawned the python3 process
		err := syscall.Getrusage(syscall.RUSAGE_CHILDREN, &rusage)
		if err != nil {
			return 0
		}

		// On Linux, MaxRSS is already in kilobytes, so no conversion needed
		return rusage.Maxrss

	default:
		// Unsupported OS - return 0 (memory monitoring won't work)
		return 0
	}
}
