# Implementation plan: AI-DLC sample app

## Summary

Convert the current Bulletproof React sample into an AI-DLC sample app with aligned frontend and Go backend architecture:

- Keep the current sample domain: auth, teams, users, discussions, comments.
- Add frontend ports/adapters with a composition root so local/mock and true-backend modes use the same UI code.
- Build the missing Go backend using clean architecture, SQLite persistence, and swappable repository adapters.
- Use OpenAPI as the frontend/backend contract source of truth.
- Document how frontend ports/adapters map to Go clean architecture concepts, including the distinction between ports, adapters, and constructors.

## Phase 1: Baseline and effort docs

- Create this effort folder under `efforts/2026-05-10-ai-dlc-sample-app/`.
- Record current reality:
  - frontend works through MSW/local mock data
  - backend folder is empty
  - no true backend exists yet
  - mock/real boundary currently lives at HTTP interception, not service registration
- Add the frontend/Go architecture glossary.

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

## Phase 3: Frontend ports and composition root

- Add frontend runtime modes:
  - `local`
  - `dev`
  - `staging`
  - `production`
- Add capability selection separately from deployment mode.
- Add:
  - `AppServicesProvider`
  - `useServices`
  - `makeServices(mode)`
- Define ports for:
  - `AuthProvider`
  - `TeamStore`
  - `UserStore`
  - `DiscussionStore`
  - `CommentStore`
  - `FlagProvider`
  - `Monitor`
- Migrate feature code away from direct Axios imports and toward service-backed hooks.

## Phase 4: Local experience adapters

- Implement local adapters behind the frontend ports.
- Use IndexedDB for persisted local data where useful.
- Keep MSW for:
  - executable scenario fixtures
  - Storybook/test request interception
  - API-contract simulation
- Add local scenarios:
  - empty app
  - logged-out user
  - admin user
  - normal user
  - expired session
  - permission denied
  - save failure
  - discussion with comments
  - no comments

## Phase 5: Go backend foundation

- Build the Go backend under `backend/` using clean architecture:
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

- Implement frontend API adapters that satisfy the same ports as local adapters.
- Keep domain mapping inside adapters.
- Validate frontend API expectations against OpenAPI.
- Validate Go handlers against OpenAPI.
- Run equivalent behavior tests against:
  - local adapters
  - API adapters backed by Go

## Phase 8: Testing and hardening

- Frontend:
  - typecheck
  - unit tests for ports/providers/adapters
  - integration tests for scenario fixtures
  - E2E in local mode and backend mode
- Backend:
  - use case unit tests with mocked repository interfaces
  - SQLite repository tests
  - REST handler tests
  - auth/session tests
- Documentation:
  - update effort progress files as phases land
  - keep mock/real boundary current
  - document frontend/Go architecture mapping in the effort docs and persistent architecture docs

## Public interfaces

Frontend service boundary:

```ts
type RuntimeMode = 'local' | 'dev' | 'staging' | 'production';

interface AppServices {
  auth: AuthProvider;
  teams: TeamStore;
  users: UserStore;
  discussions: DiscussionStore;
  comments: CommentStore;
  flags: FlagProvider;
  monitor: Monitor;
}
```

Backend API boundary:

```txt
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

## Assumptions

- Backend implementation is required because `backend/` is currently empty.
- SQLite is the first true backend store, but persistence must remain adapter-swappable.
- OpenAPI is the contract source of truth.
- IndexedDB is the preferred local persistence mechanism.
- MSW remains useful, but ports/adapters become the primary mock/real boundary.
- Effort documentation always lives in subfolders under `efforts/`.

