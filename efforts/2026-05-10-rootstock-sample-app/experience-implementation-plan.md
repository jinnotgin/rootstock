# Experience implementation plan: Rootstock sample app

## Phase 1: Baseline and effort docs

- Create this effort folder under `efforts/2026-05-10-rootstock-sample-app/`.
- Record current reality:
  - frontend works through MSW/local mock data
  - backend folder is empty
  - no true backend exists yet
  - mock/real boundary currently lives at HTTP interception, not service registration
- Add the frontend/Go architecture glossary.

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

## Phase 7: API adapters and contract tests

- Implement frontend API adapters that satisfy the same ports as local adapters.
- Keep domain mapping inside adapters.
- Validate frontend API expectations against OpenAPI.
- Run equivalent behavior tests against:
  - local adapters
  - API adapters backed by Go

## Phase 8: Testing and hardening

- Frontend:
  - typecheck
  - unit tests for ports/providers/adapters
  - integration tests for scenario fixtures
  - E2E in local mode and backend mode
- Keep effort progress files current as phases land.
- Keep the mock/real boundary current in the effort docs.

## Phase 9: Persistent agent-docs update

- Promote the durable concepts from `rootstock-context-v2.md` into `agent-docs/` so future agents can follow the architecture without reading effort-local context first.
- Sharpen the experience/foundation boundary:
  - experience work includes screens, flows, fixtures, and local adapters
  - experience work stops at the local adapters
  - foundation work can live in the frontend as well as the backend
  - frontend API adapters, auth/session integration, real service mapping, monitoring, and contract enforcement are foundation work
- Cross-link or summarize relevant frontend guidance in `agent-docs/frontend-practices/` where needed, especially API layer, project structure, testing, and state management.
- Keep effort docs as the work log and `agent-docs/` as the reusable project guidance.
