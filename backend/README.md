# Backend

This directory is the working space for your application's backend. It is
currently empty — no production code lives here yet.

## Temporary state

This is a placeholder. Once work begins, this directory will be populated by
modelling the structure from `agent-reference/backend/` for project layout,
clean architecture patterns, and dependency injection approach.

## Project structure

Before writing any code, read these files to understand the expected layout and
approach:

| Document | What it covers |
|----------|---------------|
| `agent-docs/rootstock-architecture/index.md` | Ports/adapters model, experience/foundation boundary |
| `agent-docs/backend-practices/index.md` | Use case patterns, repository ports, dependency injection |
| `agent-reference/backend/` | Complete reference implementation demonstrating the full stack |

The reference backend uses a layered directory structure:

```
backend/
  cmd/app/        — entry point and dependency wiring
  config/         — environment configuration
  internal/
    app/          — composition root and app bootstrap
    controller/   — HTTP handlers
    entity/       — domain types
    usecase/      — business logic
    repo/         — repository port implementations
    platform/     — infrastructure (database, server, middleware)
```

## Suggested technologies

Derived from the reference implementation in `agent-reference/backend/`:

**Core**
- [Go](https://go.dev) 1.25 — language

**Persistence**
- [SQLite](https://www.sqlite.org) via `github.com/mattn/go-sqlite3` — embedded relational database

**Security**
- `golang.org/x/crypto` — bcrypt password hashing
