# Multi-language code executor image supporting multiple languages
# Base: Alpine Linux (minimal, secure)
FROM alpine:3.19

# Install language runtimes and compilers
RUN apk add --no-cache \
    python3 \
    g++ \
    nodejs \
    npm \
    openjdk17-jdk

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
