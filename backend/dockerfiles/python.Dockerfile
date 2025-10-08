# Minimal Python 3 image for secure code execution
FROM python:3.11-alpine

# Create a non-root user for running code
# This prevents malicious code from having root privileges
RUN adduser -D -u 1000 coderunner

# Create workspace directory
RUN mkdir /workspace && chown coderunner:coderunner /workspace

# Switch to non-root user
USER coderunner

# Set working directory
WORKDIR /workspace

# Default command (will be overridden by docker run)
CMD ["python3"]
