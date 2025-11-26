# --- STAGE 1: BUILDER ---
# We use the standard image (same as your local) to ensure tools work
FROM golang:1.24 AS builder

WORKDIR /app

# Install git just in case dependencies need it
RUN apt-get update && apt-get install -y git

# Copy dependencies first (Caching layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# CRITICAL FIX: Disable CGO to create a static binary that runs anywhere
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# --- STAGE 2: RUNNER ---
# We use Alpine for a tiny, fast production image
FROM alpine:latest

WORKDIR /app

# Install certificates so your app can talk to YouTube/Supabase (HTTPS)
RUN apk --no-cache add ca-certificates

# Copy ONLY the compiled binary from the builder stage
COPY --from=builder /app/main .

# Create the uploads directory just in case
RUN mkdir -p uploads

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./main"]