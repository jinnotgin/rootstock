# Experience progress: Rootstock sample app

## Current mock/real boundary

Currently real:

- React routes and layouts
- UI components
- auth, registration, profile, teams, users, discussions, and comments screens
- form validation
- React Query loading and mutation flows
- unit and E2E tests for the sample frontend

Currently mocked:

- authentication/session identity
- teams, users, discussions, and comments persistence
- authorization enforcement
- backend error behavior

Current mechanism:

- Feature API modules call a shared Axios client directly.
- `VITE_APP_ENABLE_API_MOCKING` enables MSW request interception.
- MSW handlers emulate the backend API.
- `@mswjs/data` plus browser localStorage emulate persistence.

Target mechanism:

- Feature hooks consume services through frontend ports.
- A frontend composition root selects local or API adapters.
- Local adapters use IndexedDB where persistent local state is useful.
- MSW remains available for executable scenarios, Storybook/test interception, and API-contract simulation.

## 2026-05-10

Baseline analysis completed.

The frontend is currently a close Bulletproof React sample. The architectural gap is not that the sample lacks mocks; it is that the mocks live at the HTTP interception layer while application code imports concrete API request modules directly. The AI-DLC target requires stable service interfaces and adapter registration outside component/feature logic.

The backend folder exists but has no implementation. A true backend mode therefore requires building the Go backend as part of this effort.

Started the frontend service-boundary migration:

- added domain type entrypoint
- added frontend ports for auth, catalog data, flags, and monitoring
- added runtime mode and capability config parsing
- added `AppServicesProvider` and `useServices`
- added API service adapters backed by the existing Axios client
- added local service adapters backed by browser local storage as the first local persistence implementation
- wired `AppProvider` to create services through the composition root

The next frontend step is migrating auth and feature data hooks away from direct Axios imports and onto the service boundary.

Migrated auth and feature data hooks onto the service boundary while keeping existing public hook/component usage mostly stable:

- `useUser`, `useLogin`, `useRegister`, `useLogout`, `AuthLoader`, and `ProtectedRoute` now use the auth port through `useServices`
- teams, users, discussions, and comments query/mutation hooks now call service ports instead of importing Axios directly
- route loaders and prefetches use the default composition-root services
- local persistence now uses IndexedDB when available, with a localStorage fallback for environments that do not expose IndexedDB

Ran `npm run check-types`; it passed after tightening adapter return types and preserving existing mutation variable shapes.

Ran the frontend verification suite after lint cleanup:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 12 files, 21 tests
- `npm run build` passed

Vitest emitted a sandbox-only websocket listen warning for `0.0.0.0:24678`, but the test process completed successfully.

Moved the service provider and composition root from `src/app` into `src/services` so feature modules can depend on the service boundary without violating the existing Bulletproof React import direction rules.

Updated frontend env examples with runtime and capability mode variables:

- `VITE_APP_RUNTIME_MODE`
- `VITE_APP_AUTH_CAPABILITY`
- `VITE_APP_DATA_CAPABILITY`

Continued Phase 4 local adapter hardening:

- added focused HTTP adapter coverage for the `/auth/me` response shape used by the auth port
- added local adapter coverage for authorization-sensitive writes
- aligned local adapters with backend authorization behavior for:
  - admin-only user deletion
  - admin-only discussion creation, update, and deletion
  - comment deletion by admins or the comment author only

Verification for this slice:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 14 files, 24 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Vitest again emitted the sandbox-only websocket listen warning for `0.0.0.0:24678`, but the test process completed successfully.

Side-track planning update:

- split the reusable `agent-docs/` documentation update out of the generic hardening phase
- added Phase 9 to the implementation plan for promoting durable AI-DLC concepts from `rootstock-context-v2.md` into persistent project guidance
- clarified that effort docs remain the work log while `agent-docs/` should become the reusable guidance future agents read first
- sharpened the permanent architecture wording so experience work stops at local adapters, while foundation work may include frontend code such as API adapters, auth/session integration, contract mapping, monitoring, and real service wiring

Continued Phase 7 and Phase 9:

- expanded `agent-docs/rootstock-architecture.md` from a glossary into persistent AI-DLC operating guidance
- added cross-references from frontend API, project-structure, and testing guidance into the Rootstock architecture document

Renamed legacy project-facing identifiers to `rootstock`, including effort/context/architecture filenames, internal documentation links, API title text, and the local browser database key. Explanatory references to the AI development life cycle model remain where they describe the architecture concept.
- added frontend composition-root coverage proving runtime mode and capability mode are selected independently
- kept the sharpened boundary explicit: experience work owns the local product experience and local adapters; foundation work may live in frontend or backend once real services, contracts, auth, monitoring, or operational concerns enter

Verification after this slice:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 25 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Continued Phase 4 local scenarios:

- added selectable local scenario seed data behind `VITE_APP_LOCAL_SCENARIO`
- kept the default local scenario empty
- added seeded scenarios for:
  - `empty`
  - `logged-out`
  - `admin`
  - `normal-user`
  - `expired-session`
  - `permission-denied`
  - `discussion-with-comments`
  - `no-comments`
- added scenario coverage for seeded current user, discussion, and comments behavior
- moved the local default scenario question from open to answered

Targeted verification:

- `npm test -- --run src/adapters/local/__tests__/local-services.test.ts src/services/bootstrap/__tests__/services.test.ts` passed
- `npm run lint` passed
- `npm run check-types` passed

Full verification after local scenarios:

- `npm run lint` passed
- `npm run check-types` passed
- `npm test -- --run` passed: 15 files, 26 tests
- `npm run build` passed
- `GOCACHE=/tmp/go-build go test ./...` passed

Documentation maintenance:

- updated frontend agent docs to match the implemented Rootstock service
  boundary
- clarified that feature hooks consume ports through `useServices()` rather
  than concrete HTTP clients
- clarified that local adapters define local product behavior while MSW remains
  request-interception and scenario support
- tightened frontend security guidance so browser-local auth is treated as a
  local-mode fixture, not the production trust boundary
- included frontend TDD guidance for behavior, port contract, and adapter
  changes
