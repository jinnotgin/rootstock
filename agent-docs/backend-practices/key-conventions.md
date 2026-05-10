# 3. Key Conventions

## 3.1 Dependency Injection

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

## 3.2 Entities

- Located in `internal/entity`.
- Pure data structures + domain validation methods.
- No framework dependencies. No database tags driving structure.
- Shared across all layers (controllers, use cases, repos).

## 3.3 Controllers

- Grouped by transport, then versioned: `controller/restapi/v1/`, `controller/grpc/v1/`.
- Each transport has a `router.go` that wires routes and injects use cases.
- Handlers **never contain business logic**. They: parse input → call use case → format output.
- For a new API version, create a `v2/` folder and register it in `router.go`.

## 3.4 Repositories

- Located under `internal/repo/`.
- `persistent/` = database access. `webapi/` = external HTTP APIs.
- Must satisfy interfaces defined in `internal/usecase`.
- Data flows in entity format — repos convert to/from DB representations internally.

## 3.5 Versioning (all transports)

Adding v2:

1. Create `v2/` directory alongside `v1/` in the relevant controller.
2. Register new routes in the transport's `router.go`.
3. Use cases can be shared across versions or forked as needed.
