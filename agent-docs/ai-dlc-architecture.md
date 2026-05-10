# AI-DLC architecture alignment

This project aligns the frontend AI-DLC ports/adapters model with the Go clean architecture backend model.

## Shared vocabulary

```txt
Frontend port        = TypeScript interface consumed by UI/application code
Frontend adapter     = concrete implementation of that interface
Frontend constructor = service factory/composition root wiring adapters into AppServices

Go port              = Go interface defined by the consuming use case
Go adapter           = concrete implementation, e.g. SQLite repository or external API client
Go constructor       = New... function that injects dependencies into use cases, repos, and handlers
```

Constructors are not ports or adapters.

```txt
Constructor != port
Constructor != adapter

Constructor is the wiring mechanism.
Port is the interface.
Adapter is the concrete implementation.
```

## Frontend mapping

```txt
UI / route / feature hook
  -> useServices()
  -> port interface
  -> adapter selected by makeServices(mode)
```

Example:

```txt
DiscussionStore port
IndexedDbDiscussionStore adapter
ApiDiscussionStore adapter
makeServices(mode) constructor/composition root
```

Components and feature hooks should depend on the port behavior, not on Axios, IndexedDB, MSW, or a vendor SDK.

## Go backend mapping

```txt
REST handler
  -> use case
  -> repository interface defined by the use case
  -> SQLite repository adapter
```

Example:

```txt
DiscussionRepository interface in internal/usecase
SQLiteDiscussionRepository adapter in internal/repo/sqlite
NewDiscussionUseCase(repo) constructor
```

The use case owns the interface because it is the consumer. The repository implements that interface because it is the provider. `New...` functions wire concrete implementations together at the application bootstrap layer.

## Contract boundary

OpenAPI is the HTTP contract between the frontend API adapters and the Go REST handlers. Frontend domain ports remain stable even when the HTTP wire shape changes; API adapters map between OpenAPI wire types and frontend domain types.

