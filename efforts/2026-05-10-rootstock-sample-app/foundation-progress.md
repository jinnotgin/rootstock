# Foundation progress: Rootstock sample app

## Current foundation state

Currently real:

- Frontend-only MSW-backed sample behavior
- Backend architecture guidance in `agent-docs/backend-practices/index.md`

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

Added the first persistent architecture document at `agent-docs/rootstock-architecture.md`.

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

Continued backend Phase 8 hardening:

- added catalog use-case tests for admin-only discussion creation and team-scoped comment creation
- added SQLite repository coverage for comment deletion authorization
- added REST handler coverage for the `/api/auth/me` response envelope and password-hash redaction
- updated backend guidance to cross-reference the AI-DLC mapping between frontend composition roots and Go constructor injection

Verification after this slice:

- `GOCACHE=/tmp/go-build go test ./...` passed

Continued Phase 6/7 authorization contract alignment:

- changed authenticated-but-not-authorized admin-only backend actions from `ErrUnauthorized` to `ErrForbidden`
- verified REST handlers return HTTP 403 for authenticated users without permission
- updated OpenAPI to include 403 responses for admin-only user and discussion mutations
- kept unauthenticated requests mapped to 401

Targeted verification:

- `GOCACHE=/tmp/go-build go test ./...` passed
- `npm test -- --run src/adapters/local/__tests__/local-services.test.ts` passed

Full verification after the contract adjustment:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 25 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Continued backend Phase 8 hardening:

- added SQLite repository coverage for discussion pagination and team scoping
- added SQLite repository coverage that discussion deletion cascade-deletes comments
- added REST handler coverage for the authenticated user/discussion/comment flow
- moved the discussion deletion behavior question to answered: deleting a discussion cascade-deletes comments

Verification after this slice:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 26 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Documentation maintenance:

- split `agent-docs/backend-practices.md` into small topic files under
  `agent-docs/backend-practices/` while preserving the original section text
- moved the backend practices index to `agent-docs/backend-practices/index.md`
- split `agent-docs/rootstock-architecture.md` into small topic files under
  `agent-docs/rootstock-architecture/` while preserving the original section
  text
- replaced the single effort `implementation-plan.md` with `scope.md`,
  `experience-implementation-plan.md`, and `foundation-implementation-plan.md`
- updated `rootstock-context-v2.md` so future effort folders use separate
  experience and foundation implementation plans

Continued Phase 6/8 hardening:

- extended REST handler coverage so regular users create comments on team discussions while admins manage discussions
- added backend config tests for local development defaults and environment overrides
- moved the SQLite default path question to answered: `DATABASE_PATH` is configurable and defaults to `data/app.db`
- moved the regular-user comment permission question to answered

Targeted verification:

- `GOCACHE=/tmp/go-build go test ./internal/controller/restapi/v1` passed
- `GOCACHE=/tmp/go-build go test ./config` passed

Full verification after this slice:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 26 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Closed the remaining open contract/config questions after review:

- preserved the current mixed mutation response shape for this sample
- kept `{ message: string }` as the canonical minimal error envelope
- kept handwritten OpenAPI as the source of truth for now
- enforced JWT secret policy in backend config:
  - local/dev may use the development default
  - staging/production must configure `JWT_SECRET`
- documented `APP_ENV` and the JWT policy in `backend/README.md`

Verification after this slice:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 26 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed
