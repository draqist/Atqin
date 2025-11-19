This is a comprehensive, professional-grade **README.md** for the **Iqraa** repository. It documents your architecture, tech stack, installation steps, and future roadmap.

You can create a file named `README.md` in the root of your `iqraa` folder and paste this content in.

-----

````markdown
# Iqraa (إقرأ)

**The Digital Halaqah & Mutuun Memorization Platform.**

> *"Read! In the name of your Lord who created..."*

Iqraa is a modern Islamic Learning Management System (LMS) designed to bridge the gap between traditional *Mutuun* (scholarly texts) study and modern technology. It combines a powerful library system, Spaced Repetition (SRS) for memorization, and a recursive data structure to handle complex texts like *Ash-Shatibiyyah* and *Al-Jazariyyah*.

---

## 🚀 Project Status: Phase 1 (Foundation)
We are currently in **Phase 1**. The foundation is built, the database schema is active, and the frontend can read/display books.

- [x] **Backend Architecture:** Go (Golang) API with Postgres & Redis.
- [x] **Data Structure:** Recursive "Node" system for Chapters/Verses.
- [x] **Frontend:** Next.js App Router with TanStack Query & Redux.
- [x] **UI System:** Shadcn UI + Tailwind CSS.
- [ ] **Phase 2:** Resource Aggregation (Internet Archive / YouTube).
- [ ] **Phase 3:** Memorization Tools (SRS & AI).

---

## 🛠 Tech Stack

This project uses a "Power Stack" designed for high performance, type safety, and scalability.

### **Backend (The Brain)**
* **Language:** [Go (Golang) 1.24+](https://go.dev/) - *Chosen for speed and concurrency.*
* **Database:** [PostgreSQL](https://www.postgresql.org/) - *Relational data with JSONB support.*
* **Caching:** [Redis](https://redis.io/) - *For blazing fast session/query caching.*
* **Router:** Standard Library `net/http` (Go 1.22+) - *No bloated frameworks.*
* **Migrations:** `golang-migrate` - *Version controlled database changes.*
* **DevOps:** Docker & Docker Compose.

### **Frontend (The Face)**
* **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router) - *Server Components & SEO.*
* **Language:** TypeScript.
* **State (Server):** [TanStack Query](https://tanstack.com/query/latest) - *Caching & API state.*
* **State (Client):** [Redux Toolkit](https://redux-toolkit.js.org/) + Redux Persist.
* **UI Library:** [Shadcn UI](https://ui.shadcn.com/) - *Accessible, unstyled components.*
* **Styling:** Tailwind CSS.

---

## 🏗 Architecture

### The Monorepo Structure
```text
iqraa/
├── backend/                # Go API
│   ├── cmd/api/            # Entry point (main.go, handlers)
│   ├── internal/data/      # Database Models (The Chefs)
│   └── migrations/         # SQL Migration files
├── frontend/               # Next.js App
│   ├── src/app/            # Pages & Layouts
│   ├── src/components/     # Shadcn UI Components
│   ├── src/lib/            # Redux & Utils
│   └── src/hooks/          # TanStack Query Hooks
├── docker-compose.yml      # Database & Cache orchestration
└── Makefile                # Command shortcuts
````

### The Data Model (Recursive Trees)

Unlike standard apps that treat books as flat text, Iqraa uses a **Recursive Node Tree**.

  * **Book:** The container (*Ash-Shatibiyyah*).
  * **Node (Chapter):** A parent node (*Introduction*).
  * **Node (Bayt/Verse):** A child node (*Line 1 of poetry*).

This allows us to link specific audio, video, or notes to a single line of poetry, essential for deep study (*Qiraat*).

-----

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

## 📜 License

Distributed under the MIT License.

```
```