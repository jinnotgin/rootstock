# Foundation implementation plan: Rootstock sample app

## Phase 2: API contract first

- Freeze the current frontend/MSW API surface as the initial contract candidate.
- Create OpenAPI for:
  - auth
  - teams
  - users
  - discussions
  - comments
  - healthcheck
- Normalize and document:
  - pagination response shape
  - auth cookie behavior
  - error envelope
  - authorization failures
  - validation failures

## Phase 5: Go backend foundation

- Build the Go backend under `backend/` using clean architecture. The completed reference implementation now lives under `reference/backend/`:
  - `cmd/app`
  - `config`
  - `internal/app`
  - `internal/entity`
  - `internal/usecase`
  - `internal/controller/restapi/v1`
  - `internal/repo/sqlite`
  - `docs/openapi`
- Use SQLite as the first persistence adapter.
- Define repository interfaces inside use cases.
- Implement concrete SQLite repositories as adapters.
- Use `New...` constructors for dependency injection.
- Keep docs explicit that Go constructor injection is the backend equivalent of frontend composition-root wiring, not the same thing as a port.

## Phase 6: Backend features

- Implement email/password auth:
  - register
  - login
  - logout
  - current user
  - bcrypt password hashing
  - JWT in HttpOnly cookie
- Implement teams, users, discussions, and comments to match the OpenAPI contract.
- Add authorization rules matching the current sample behavior.
- Add migrations and seed/dev data support where needed.

## Phase 7: API adapters and contract tests

- Validate Go handlers against OpenAPI.
- Run equivalent behavior tests against:
  - local adapters
  - API adapters backed by Go

## Phase 8: Testing and hardening

- Backend:
  - use case unit tests with mocked repository interfaces
  - SQLite repository tests
  - REST handler tests
  - auth/session tests
- Keep effort progress files current as phases land.
- Keep the mock/real boundary current in the effort docs.

## Phase 9: Persistent agent-docs update

- Promote the durable concepts from `rootstock-context-v2.md` into `agent-docs/` so future agents can follow the architecture without reading effort-local context first.
- Sharpen the experience/foundation boundary:
  - experience work includes screens, flows, fixtures, and local adapters
  - experience work stops at the local adapters
  - foundation work can live in the frontend as well as the backend
  - frontend API adapters, auth/session integration, real service mapping, monitoring, and contract enforcement are foundation work
- Update `agent-docs/rootstock-architecture/` with the implemented sample app mapping:
  - runtime mode versus capability mode
  - frontend ports, adapters, and composition root
  - local adapters, API adapters, and MSW's remaining role
  - OpenAPI as the frontend/backend contract boundary
  - Go clean architecture ports, adapters, and constructor injection
  - why constructors are wiring, not ports
- Cross-link or summarize relevant backend guidance in `agent-docs/backend-practices/` where needed, especially use-case-owned interfaces, repository adapters, and bootstrap wiring.
- Keep effort docs as the work log and `agent-docs/` as the reusable project guidance.
