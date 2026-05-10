# Foundation decisions: AI-DLC sample app

## 2026-05-10

### Build the missing Go backend

Decision: implement the backend under `backend/`.

Reasoning: this checkout has an empty backend directory. The frontend currently works only because MSW emulates backend behavior. A true backend mode requires an actual API, persistence, auth, validation, and authorization implementation.

### Use SQLite first, keep persistence swappable

Decision: SQLite is the first true backend persistence adapter.

Reasoning: SQLite keeps local setup simple while still giving the backend real persistence, migrations, transactions, and repository behavior. The Go architecture must still define repository interfaces in the use case layer so SQLite can later be replaced by Postgres or another store.

Rejected: memory-only backend persistence. It would be fast to scaffold but would not prove enough of the foundation layer.

### Use OpenAPI as the contract source of truth

Decision: OpenAPI should define the HTTP API contract for the sample app.

Reasoning: the frontend needs generated or validated API adapter types, and the Go handlers need a contract to implement. OpenAPI is the shared artifact between experience and foundation work.

### Use email/password auth with JWT cookie

Decision: true backend auth should use email/password login, bcrypt password hashing, and a JWT stored in an HttpOnly cookie.

Reasoning: this matches the current frontend and MSW flows while giving the backend a realistic foundation implementation.

### Clarify ports, adapters, and constructors across frontend and Go

Decision: docs must explicitly distinguish ports, adapters, and constructors.

Shared vocabulary:

```txt
Frontend port        = TypeScript interface consumed by UI/application code
Frontend adapter     = concrete implementation of that interface
Frontend constructor = service factory/composition root wiring adapters into AppServices

Go port              = Go interface defined by the consuming use case
Go adapter           = concrete implementation, e.g. SQLite repository or external API client
Go constructor       = New... function that injects dependencies into use cases, repos, and handlers
```

Important clarification:

```txt
Constructor != port
Constructor != adapter

Constructor is the wiring mechanism.
Port is the interface.
Adapter is the concrete implementation.
```

Example mapping:

```txt
Frontend:
DiscussionStore port
IndexedDbDiscussionStore adapter
ApiDiscussionStore adapter
makeServices(mode) constructor/composition root

Go:
DiscussionRepository interface in internal/usecase
SQLiteDiscussionRepository adapter in internal/repo/sqlite
NewDiscussionUseCase(repo) constructor
```

