# Rootstock sample frontend

This frontend is the reference implementation of the rootstock ports/adapters model. It demonstrates how a React app can run fully offline in local mode, then swap in real API adapters without changing any feature code.

For architectural guidance see `agent-docs/rootstock-architecture/` and `rootstock-context-v2.md`.

## Get started

Prerequisites:

- Node 20+
- npm 10+

```sh
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3770](http://localhost:3770) to view the app.

To run against the Go backend, start it first (`go run ./cmd/app` in `agent-reference/backend`), then set `VITE_APP_RUNTIME_MODE=dev` in `.env`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run test` | Run Vitest unit/integration tests |
| `npm run lint` | Lint with ESLint |
| `npm run check-types` | Type-check without emitting |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run test-e2e` | Run Playwright end-to-end tests |

## Architecture

```
src/
  ports/           # Interfaces the app depends on (AuthProvider, DiscussionStore, etc.)
  adapters/
    local/         # In-memory implementations for offline/local mode
    http/          # Real API implementations that call the backend
  services/
    bootstrap/     # Composition root — selects adapters based on runtime config
    app-services-provider.tsx  # React context that injects services into the tree
  domain/          # Shared domain types
  app/             # Routes and top-level providers
  features/        # Feature modules (discussions, comments, users, teams)
  components/      # Shared UI components
  lib/             # Utilities (api-client, auth, react-query)
  testing/         # Test adapters, data generators, MSW handlers
```

### Ports and adapters

Ports are TypeScript interfaces in `src/ports/` that define what the app needs:

- `AuthProvider` — login, register, logout, get current user
- `DiscussionStore`, `CommentStore` — CRUD for discussions and comments
- `TeamStore`, `UserStore` — team and user management
- `FlagProvider` — feature flags
- `Monitor` — logging and error reporting

Adapters implement these interfaces. `src/adapters/local/` provides in-memory fakes; `src/adapters/http/` calls the real backend API.

### Composition root

`src/services/bootstrap/services.ts` reads the runtime config and wires the correct adapter for each port. `AppServicesProvider` exposes the wired services via React context. Feature code calls `useServices()` and never knows which adapter is behind it.

## Environment variables

All env vars are prefixed with `VITE_APP_` and validated by Zod at startup.

| Variable | Values | Default |
|---|---|---|
| `RUNTIME_MODE` | `local`, `dev`, `staging`, `production` | `local` |
| `DATA_CAPABILITY` | `local`, `api` | derived from mode |
| `AUTH_CAPABILITY` | `local`, `api` | derived from mode |
| `LOCAL_SCENARIO` | `empty`, `logged-out`, `admin`, `normal-user`, `expired-session`, `permission-denied`, `discussion-with-comments`, `no-comments` | `empty` |
| `API_URL` | any URL | `http://localhost:8770/api` |
| `ENABLE_API_MOCKING` | `true`, `false` | — |

In `local` mode both capabilities default to `local`, so the app works with no backend. Set `RUNTIME_MODE=dev` to switch to API adapters.
