# 1. Use the Debian Bookworm image (Stable & "Batteries Included")
# Using 'latest' ensures you have Go 1.25+ to satisfy Air's requirements
FROM golang:latest

# 2. Set working directory
WORKDIR /app

# 3. Install Git (Debian uses apt-get, not apk)
# We run update to ensure package lists are fresh
RUN apt-get update && apt-get install -y git

# 4. Install Air
# Since we are on the latest Go, we can safely use @latest
RUN go install github.com/air-verse/air@latest

# 5. Copy dependency files
COPY go.mod go.sum ./

# 6. Download dependencies
RUN go mod download

# 7. Copy the source code
COPY . .

# 8. Run Air
CMD ["air"]