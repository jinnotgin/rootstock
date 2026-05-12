# Rootstock

A full-stack reference architecture for experience-first, AI-assisted development. The frontend runs fully offline in local mode and swaps to real API adapters without changing feature code. The backend uses clean architecture with swappable repository adapters.

---

## Architecture

Rootstock separates work into two tracks that stay in sync without stepping on each other:

**Experience track** — screens, flows, states, copy, fixtures, local adapters, user-facing tests. Runs completely offline with no secrets.

**Foundation track** — real auth, persistence, API contracts, backend services, production integrations, monitoring, security hardening.

Both tracks live in the same codebase. The separation is by concern, not by team boundary.

For the full model see [`agent-docs/rootstock-architecture/`](agent-docs/rootstock-architecture/index.md).

---

## Repository layout

```
frontend/          # React 19 + TypeScript — ports/adapters SPA
backend/           # Go — clean architecture REST API
agent-docs/        # Durable architecture and practice docs
agent-reference/   # Complete reference implementation (read-only)
efforts/           # Per-effort scope, plans, decisions, progress
AGENTS.md          # AI agent instructions
```

### Frontend (`frontend/`)

A React 19 / TypeScript / Vite app built on a ports/adapters model.

```
src/
  ports/           # Interfaces the app depends on (AuthProvider, DiscussionStore …)
  adapters/
    local/         # In-memory implementations — no backend required
    http/          # Real API implementations
  services/
    bootstrap/     # Composition root — selects adapters from RUNTIME_MODE
    app-services-provider.tsx
  domain/          # Shared domain types
  app/             # Routes and top-level providers
  features/        # Feature modules (discussions, comments, users, teams)
  components/      # Shared UI components
  lib/             # Utilities (api-client, auth, react-query)
  testing/         # Test adapters, data generators, MSW handlers
```

Key libraries: React Router 7, TanStack Query 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Zod 4, React Hook Form 7, Vitest 4, Playwright, MSW 2, Storybook 10.

### Backend (`backend/`)

A Go REST API using clean architecture.

```
cmd/app/           # Entry point and dependency wiring
config/            # Environment configuration
internal/
  app/             # Composition root
  controller/      # HTTP handlers
  entity/          # Domain types
  usecase/         # Business logic
  repo/            # Repository port implementations
  platform/        # Infrastructure (database, server, middleware)
```

Persistence: SQLite via `go-sqlite3`. Password hashing: `golang.org/x/crypto/bcrypt`.

---

## Modes of operation

| Mode | What runs |
|---|---|
| `local` | Browser only — fixture data, in-memory adapters, no backend |
| `dev` | Real app code with dev services and sandboxed dependencies |
| `staging` | Staging services and contract-equivalent integrations |
| `production` | Production services, credentials, monitoring |

Local mode remains useful after connected modes exist — demos, edge-case testing, onboarding, bug reproduction.

---

## Environment variables

Set in `frontend/.env` (prefix `VITE_APP_`):

| Variable | Values | Default |
|---|---|---|
| `RUNTIME_MODE` | `local`, `dev` | `local` |
| `DATA_CAPABILITY` | `local`, `api` | derived from mode |

`RUNTIME_MODE=local` requires no backend. `RUNTIME_MODE=dev` switches all adapters to real HTTP.

---

## API surface

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /teams

GET    /users
PATCH  /users/profile
DELETE /users/{userId}

GET    /discussions
POST   /discussions
GET    /discussions/{discussionId}
PATCH  /discussions/{discussionId}
DELETE /discussions/{discussionId}

GET    /comments?discussionId={discussionId}
POST   /comments
DELETE /comments/{commentId}

GET    /healthcheck
```

---

## Development

```sh
# Frontend
cd frontend
npm install
npm run dev          # local mode, no backend needed

# Backend
cd backend
go run ./cmd/app     # starts the Go API server
```

Tests:

```sh
cd frontend
npm test             # Vitest unit/component tests
npm run test:e2e     # Playwright end-to-end tests
```

---

## Effort documentation

All feature work is logged under `efforts/YYYY-MM-DD-<slug>/`:

| File | Purpose |
|---|---|
| `scope.md` | In/out of scope, mock/real boundary |
| `experience-implementation-plan.md` | Vertical slices for experience work |
| `foundation-implementation-plan.md` | Vertical slices for foundation work |
| `*-decisions.md` | What was decided, why, what was rejected |
| `*-progress.md` | Causal timeline of what happened |
| `open-questions.md` | Unresolved items tagged by owner |

---

## Reference material

- Architecture: [`agent-docs/rootstock-architecture/`](agent-docs/rootstock-architecture/index.md)
- Frontend practices: [`agent-docs/frontend-practices/`](agent-docs/frontend-practices/)
- Backend practices: [`agent-docs/backend-practices/`](agent-docs/backend-practices/)
- Reference implementation: [`agent-reference/`](agent-reference/)
- Agent instructions: [`AGENTS.md`](AGENTS.md)
