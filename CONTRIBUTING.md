## ⚡ Getting Started

### Prerequisites

  * [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
  * [Go 1.24+](https://go.dev/dl/)
  * [Node.js 18+](https://nodejs.org/)

### 1\. Clone & Setup

```bash
git clone [https://github.com/yourusername/iqraa.git](https://github.com/yourusername/iqraa.git)
cd iqraa
```

### 2\. Start the Infrastructure (DB & Redis)

We use Docker for the database to keep your machine clean.

```bash
make up
# This runs 'docker compose up' to start Postgres (port 5432) and Redis (port 6379).
```

### 3\. Run Database Migrations

Initialize the database tables (`books`, `content_nodes`).

```bash
make migrate-up
```

### 4\. Run the Backend (Go)

Open a new terminal in `iqraa/backend`.

```bash
# Set the local DB connection string
export DB_DSN="postgres://user:password@localhost:5432/iqraa_db?sslmode=disable"

# Run with Air (Hot Reload)
air
# OR standard run:
go run ./cmd/api
```

*Server will start on `http://localhost:8080`*

### 5\. Run the Frontend (Next.js)

Open a new terminal in `iqraa/frontend`.

```bash
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

*App will start on `http://localhost:3000`*

-----

## 📖 API Reference

### Books

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/books` | List all books in the library |
| `GET` | `/v1/books/{id}` | Get metadata for a specific book |
| `POST` | `/v1/books` | Create a new book |

### Content (Nodes)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/books/{id}/nodes` | Get the full content tree (Chapters & Verses) |
| `POST` | `/v1/books/{id}/nodes` | Append a chapter or verse to a book |

-----

## 🧪 Development Workflow

### "The Hybrid Approach"

We recommend running **Databases in Docker** but **Code on your Machine**.

1.  `make up` -\> Starts Postgres/Redis.
2.  `air` -\> Runs Go locally (faster than Docker build).
3.  `npm run dev` -\> Runs Next.js locally.

### Useful Commands (Makefile)

  * `make up`: Start Docker services.
  * `make down`: Stop Docker services.
  * `make shell-be`: SSH into the backend container (if running fully in Docker).
  * `make migrate-up`: Apply latest database changes.
  * `make migrate-create name=some_name`: Create a new SQL migration file.

-----

## 🤝 Contributing

1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.