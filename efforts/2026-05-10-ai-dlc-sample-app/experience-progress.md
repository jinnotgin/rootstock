# Experience progress: AI-DLC sample app

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
