# Rootstock sample backend

This backend is the reference implementation of the rootstock clean architecture model. It serves the API that the frontend consumes when running in `dev`, `staging`, or `production` mode (i.e., when the frontend's adapters point at a real backend instead of local fakes).

It follows the guidance in `agent-docs/backend-practices/` and aligns with the frontend's ports/adapters model.

## Get started

Prerequisites:

- Go 1.22+
- CGO enabled (required by SQLite driver)
- [Air](https://github.com/air-verse/air) (optional, for live reload)

### Run the server

```sh
go run ./cmd/app
```

The server starts on `:8770` by default. The API is mounted under `/api` and the OpenAPI contract lives at `docs/openapi/openapi.yaml`.

### Live reload with Air

Air watches for file changes and automatically rebuilds and restarts the server — no manual stop/start cycle needed.

```sh
# Install Air (one-time)
go install github.com/air-verse/air@latest

# Make sure ~/go/bin is on your PATH
export PATH=$PATH:$HOME/go/bin

# Start the server with live reload
air
```

Air is configured via `.air.toml` in this directory. It watches `.go` files, excludes tests and the `data/`/`docs/` directories, and outputs the binary to `tmp/` (which is gitignored).

## Configuration

All settings are read from environment variables with sensible defaults for local development.

| Variable | Default | Notes |
|---|---|---|
| `APP_ENV` | `local` | `local`, `dev`, `staging`, `production` |
| `ADDRESS` | `:8770` | Listen address |
| `DATABASE_PATH` | `data/app.db` | SQLite database file |
| `JWT_SECRET` | `dev-secret-change-me` | Must be set explicitly for staging/production |
| `COOKIE_NAME` | `bulletproof_react_app_token` | Auth cookie name |
| `ALLOWED_ORIGIN` | `http://localhost:3770` | CORS allowed origin |

## Architecture

```
cmd/app/             # Entry point
config/              # Environment-based configuration
internal/
  app/               # Composition root — wires dependencies and starts the server
  entity/            # Domain models (User, Team, Discussion, Comment)
  usecase/           # Business logic (AuthUseCase, CatalogUseCase)
  repo/sqlite/       # Repository adapter — SQLite implementation
  controller/restapi/v1/  # HTTP handler adapter — REST API routes
  platform/          # Infrastructure adapters (ID generation, clock)
docs/openapi/        # OpenAPI specification
```

### Architecture mapping

```
Go port        = interface defined by the use case (e.g., AuthRepository, CatalogRepository)
Go adapter     = concrete implementation (e.g., sqlite.Repo, v1.Handler)
Go constructor = New... function that injects dependencies
```

Use cases define the interfaces they need (ports). The composition root in `internal/app/app.go` wires concrete adapters to those ports:

```
sqlite.Repo  -> AuthRepository, CatalogRepository
v1.Handler   -> HTTP routes calling use cases
platform.*   -> IDGenerator, Clock
```

### Testing

Use cases own their port interfaces, so tests inject fakes/stubs directly. Test adapters live in `_test.go` files alongside the use case code (see `internal/usecase/test_adapters_test.go`). They belong to the test harness, not the production composition root.
