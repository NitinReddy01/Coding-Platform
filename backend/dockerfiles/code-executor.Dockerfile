# Multi-language code executor image supporting multiple languages
# Base: Alpine Linux (minimal, secure)
FROM alpine:3.19

# Install language runtimes and compilers
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    gcc \
    musl-dev \
    linux-headers \
    g++ \
    nodejs \
    npm \
    openjdk17-jdk

# Install Python packages for memory tracking
# Note: python3-dev, gcc, musl-dev, linux-headers are needed to build psutil
RUN pip3 install --no-cache-dir --break-system-packages psutil

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
