# Iqraa (إقرأ)

**The Digital Rihal & Mutuun Memorization Platform.**

> *"Read! In the name of your Lord who created..."*

Iqraa is a modern, open-source Islamic Learning Management System (LMS) designed to bridge the gap between traditional *Mutuun* (scholarly texts) study and modern technology. 

Unlike standard PDF readers, Iqraa treats text as a recursive tree structure, enabling line-by-line audio sync, deep-linking for *Sharh* (explanations), and AI-powered memorization testing.

## 🌟 Core Features
- **The Digital Library:** Verified, digitized texts (not PDFs) with rich metadata.
- **Structured Learning:** Books broken down into Chapters, Sections, and Bayts (Verses).
- **Memorization (Hifdh):** Spaced Repetition System (SRS) built into the core.
- **AI Companion:** (Coming Soon) Real-time recitation correction.

## 🛠 Tech Stack
**Backend:** Go (Golang) 1.24, PostgreSQL, Redis, Docker.
**Frontend:** Next.js 14 (App Router), TypeScript, TanStack Query, Redux Toolkit.
**UI:** Shadcn UI + Tailwind CSS.

## 🚀 Quick Start
For detailed setup instructions, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 🗺 Roadmap
See what we are building next in [ROADMAP.md](./ROADMAP.md).

## 📄 License
Distributed under the MIT License.

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