# Foundation decisions: Rootstock sample app

## 2026-05-10

### Build the missing Go backend

Decision: implement the backend under `backend/`.

Reasoning: at the start of this effort, the checkout had an empty backend directory. The frontend worked only because MSW emulated backend behavior. A true backend mode required an actual API, persistence, auth, validation, and authorization implementation.

Follow-up: the completed sample backend has been moved to `reference/backend/`. The root `backend/` directory is intentionally empty for future work.

### Use SQLite first, keep persistence swappable

Decision: SQLite is the first true backend persistence adapter.

Reasoning: SQLite keeps local setup simple while still giving the backend real persistence, migrations, transactions, and repository behavior. The Go architecture must still define repository interfaces in the use case layer so SQLite can later be replaced by Postgres or another store.

Rejected: memory-only backend persistence. It would be fast to scaffold but would not prove enough of the foundation layer.

### Use OpenAPI as the contract source of truth

Decision: OpenAPI should define the HTTP API contract for the sample app.

Reasoning: the frontend needs generated or validated API adapter types, and the Go handlers need a contract to implement. OpenAPI is the shared artifact between experience and foundation work.

Follow-up decision: keep OpenAPI handwritten as the source of truth for now. Generated frontend clients/types may consume it later, but backend annotations should not replace it while the architecture is still settling.

Reasoning: a handwritten contract keeps review focused on the product boundary instead of the current handler implementation. Backend-generated OpenAPI can be introduced later if the team wants implementation-derived docs after the contract stabilizes.

### Use email/password auth with JWT cookie

Decision: true backend auth should use email/password login, bcrypt password hashing, and a JWT stored in an HttpOnly cookie.

Reasoning: this matches the current frontend and MSW flows while giving the backend a realistic foundation implementation.

Follow-up decision: the development JWT secret default is allowed only for `local` and `dev`. `staging` and `production` must configure `JWT_SECRET` explicitly.

Reasoning: local onboarding should stay frictionless, but deployable environments should fail fast rather than accidentally using the sample development secret.

### Preserve the current mutation response shape

Decision: preserve the current mixed response shape for this sample. Entity lookup reads such as `/auth/me` and `GET /discussions/{id}` use `{ data: ... }`; mutations return the changed entity directly where that matches the existing frontend/MSW contract.

Reasoning: this avoids broad churn while the sample app architecture is still being proven. If consistency becomes more valuable later, normalize in a versioned API pass.

### Keep the minimal error envelope

Decision: the canonical error envelope for this sample is `{ message: string }`.

Reasoning: this matches the frontend notification path and current MSW/backend behavior. A richer envelope such as `{ code, message, fieldErrors }` is better for production apps, but should be introduced when there is a concrete validation or UI requirement.

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
