# --- STAGE 1: BUILD ---
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

# Copy dependencies first (Caching layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the binary
# -o main: output filename
# ./cmd/api: entry point
RUN go build -o main ./cmd/api

# --- STAGE 2: RUN ---
FROM alpine:latest

WORKDIR /app

# Install basic certs for HTTPS calls (YouTube API, etc)
RUN apk --no-cache add ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Create uploads directory (for your local file server)
RUN mkdir -p uploads

# Expose the port (Render sets PORT env var, but this is good documentation)
EXPOSE 8080

# Run the binary directly (No Air!)
CMD ["./main"]