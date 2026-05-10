# Foundation progress: AI-DLC sample app

## Current foundation state

Currently real:

- Frontend-only MSW-backed sample behavior
- Backend architecture guidance in `agent-docs/backend-practices.md`

Currently missing:

- Go module
- HTTP server
- OpenAPI contract
- SQLite migrations
- auth use case
- user/team/discussion/comment use cases
- SQLite repositories
- REST handlers
- backend tests

Expected replacement path:

```txt
MSW auth handler              -> Go auth REST handler + AuthUseCase
MSW users handler             -> Go user REST handler + UserUseCase
MSW teams handler             -> Go team REST handler + TeamUseCase
MSW discussions handler       -> Go discussion REST handler + DiscussionUseCase
MSW comments handler          -> Go comment REST handler + CommentUseCase
@mswjs/data/localStorage      -> SQLite repositories
Frontend direct Axios modules -> Frontend API adapters behind ports
```

## 2026-05-10

Implementation plan captured before code changes.

The backend should follow the clean architecture guidance already present in the repo:

- dependencies point inward
- use cases define their own repository interfaces
- repositories implement those interfaces
- controllers call use cases
- constructors inject dependencies
- app bootstrap performs wiring

Added the first persistent architecture document at `agent-docs/ai-dlc-architecture.md`.

Added the initial OpenAPI contract at `backend/docs/openapi/openapi.yaml`. It freezes the current sample app API surface for auth, teams, users, discussions, comments, and healthcheck.

Started the Go backend implementation under `backend/`:

- Go module and app entrypoint
- environment config
- clean architecture folders
- domain entities
- auth and catalog use cases
- SQLite repository adapter
- REST v1 router
- session cookie manager
- app bootstrap wiring constructors

Added a focused auth use-case test and ran the backend test suite with `GOCACHE=/tmp/go-build go test ./...`; it passed after fixing the fake ID generator in the test.

Ran `go mod tidy` to resolve backend dependencies for bcrypt and SQLite.

Final backend verification for this slice:

- `GOCACHE=/tmp/go-build go test ./...` passed
