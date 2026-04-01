# Build stage
FROM golang:1.23-alpine AS build

# Install CA certificates and timezone data at build stage
# These will be copied into the final scratch image
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the Go application as a static binary
# CGO_ENABLED=0 ensures it doesn't need C libraries on the final scratch image
RUN CGO_ENABLED=0 GOOS=linux go build -v -ldflags="-w -s" -o main ./cmd/api

# Final stage: minimal image
FROM scratch

# Copy CA certificates for HTTPS requests (e.g., AWS S3, Supabase)
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data
COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo

# Copy the compiled binary
COPY --from=build /app/main /main

# Expose port (internal)
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/main"]
