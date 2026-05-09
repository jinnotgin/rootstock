# Go Clean Architecture — Agent Guidance & Best Practices

> Reference doc for AI agents working within this codebase. Covers project structure, architectural rules, and conventions.

---

## 1. Architecture Overview

This project follows **Clean Architecture** (Robert C. Martin). The core rule:

**Dependencies point inward.** Business logic never imports from outer layers.

```
Controllers (REST/gRPC/AMQP/NATS)
    ↓ calls via interface
Use Cases (business logic)
    ↓ calls via interface
Repositories / Web APIs (infrastructure)
```

There are exactly **two conceptual layers**:

| Layer | Contains | Rules |
|-------|----------|-------|
| **Inner (business logic)** | `internal/usecase`, `internal/entity` | No imports from outer layer. Use only stdlib + interfaces. |
| **Outer (tools)** | Controllers, repos, pkg, frameworks | Components are unaware of each other. Communicate only through use cases. |

---

## 2. Project Structure

```
cmd/app/main.go          → Entrypoint. Config + logger init, then delegates to internal/app.
config/                   → Env-based config (12-factor). See .env.example.
docs/                     → Auto-generated Swagger + protobuf definitions. Do not edit manually.
integration-test/         → Containerized integration tests.
internal/
  app/                    → App bootstrap (Run function), DI wiring, graceful shutdown.
    app.go                → Main wiring. Split into multiple files if it grows.
    migrate.go            → DB migrations (build tag: `migrate`).
  controller/             → Inbound adapters (entry points).
    restapi/              → Fiber HTTP handlers + Swagger annotations.
    grpc/                 → gRPC service implementations.
    amqp_rpc/             → RabbitMQ RPC handlers.
    nats_rpc/             → NATS RPC handlers.
  entity/                 → Domain models. Used across all layers. May contain validation methods.
  usecase/                → Business logic. One file = one struct = one domain area.
  repo/
    persistent/           → Database repositories (Postgres via Squirrel).
    webapi/               → External API clients (e.g. translation service).
pkg/                      → Shared library code (rabbitmq, nats, etc.).
```

---

## 3. Key Conventions

### 3.1 Dependency Injection

- All dependencies are injected via **constructor functions** (`New...`).
- Use cases define the interfaces they need. Repositories implement them.
- The use case package **must not import** repository or controller packages.

```go
// internal/usecase — defines its own interface
type Repository interface {
    Get(ctx context.Context, id string) (*entity.Thing, error)
}

type UseCase struct {
    repo Repository
}

func New(r Repository) *UseCase {
    return &UseCase{repo: r}
}
```

### 3.2 Entities

- Located in `internal/entity`.
- Pure data structures + domain validation methods.
- No framework dependencies. No database tags driving structure.
- Shared across all layers (controllers, use cases, repos).

### 3.3 Controllers

- Grouped by transport, then versioned: `controller/restapi/v1/`, `controller/grpc/v1/`.
- Each transport has a `router.go` that wires routes and injects use cases.
- Handlers **never contain business logic**. They: parse input → call use case → format output.
- For a new API version, create a `v2/` folder and register it in `router.go`.

### 3.4 Repositories

- Located under `internal/repo/`.
- `persistent/` = database access. `webapi/` = external HTTP APIs.
- Must satisfy interfaces defined in `internal/usecase`.
- Data flows in entity format — repos convert to/from DB representations internally.

### 3.5 Versioning (all transports)

Adding v2:

1. Create `v2/` directory alongside `v1/` in the relevant controller.
2. Register new routes in the transport's `router.go`.
3. Use cases can be shared across versions or forked as needed.

---

## 4. Architectural Rules — Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Define interfaces in the **consumer** package (use case) | Define interfaces in the **provider** package (repo) |
| Keep use cases free of HTTP/gRPC/DB concerns | Import `fiber`, `pgx`, or `grpc` in use case code |
| Pass `internal/entity` types across boundaries | Pass DB row structs or protobuf types into use cases |
| Use constructor injection for all dependencies | Use global variables or service locators |
| One struct per file in `usecase/` | Monolithic use case files spanning multiple domains |
| Let controllers handle serialization / error mapping | Return HTTP status codes from use cases |
| Communicate between outer-layer components through use cases | Call a repository directly from a controller |
| Add layers only when genuinely needed | Add abstraction for abstraction's sake |

---

## 5. Domain Reference

Three domains are implemented, each spanning all four transports:

| Domain | Use Case Struct | Key Behavior |
|--------|-----------------|--------------|
| **Auth** | `UserUseCase` | Register, login, JWT auth, profile retrieval. Bcrypt passwords. |
| **Tasks** | `TaskUseCase` | CRUD + status state machine (`todo` → `in_progress` → `done`). User-scoped. Paginated. |
| **Translation** | `TranslationUseCase` | Translate via external API, persist history. |

When adding a new domain:

1. Define entities in `internal/entity/`.
2. Create use case struct + interface in `internal/usecase/`.
3. Implement repo in `internal/repo/persistent/` or `internal/repo/webapi/`.
4. Add controller handlers in each transport's `v1/` directory.
5. Wire everything in `internal/app/app.go`.

---

## 6. Infrastructure & Config

- **Config**: Environment variables only (12-factor). Struct in `config/config.go`, example in `.env.example`.
- **Migrations**: Auto-run with build tag `migrate` → `go run -tags migrate ./cmd/app`.
- **Logging**: Zerolog (structured, JSON).
- **Metrics**: Prometheus via `/metrics` endpoint.
- **Docs**: Swagger auto-generated by `swag`. Proto files in `docs/proto/`.
- **Mocks**: Generated with `go.uber.org/mock`. Interfaces in use case package drive mock generation.

---

## 7. Testing

- **Unit tests**: Mock interfaces defined in use cases. Test business logic in isolation.
- **Integration tests**: Run in separate container via `make compose-up-integration-test`. Test full request flows against real DB/MQ.

---

## 8. Communication Flow Example

HTTP request to update a task, which also needs a DB read:

```
REST Controller     →  (interface)  →  TaskUseCase
                                        TaskUseCase  →  (interface)  →  TaskRepo (Postgres)
                                        TaskUseCase  ←                  TaskRepo
REST Controller     ←                  TaskUseCase
```

Every `→` / `←` crossing a layer boundary goes through an **interface**. No concrete type leaks between layers.