# Rootstock architecture alignment

This project uses an experience-first, foundation-backed AI-DLC model.
Experience work produces running product experience: screens, flows, states,
copy, fixtures, interaction behavior, and local adapters. Foundation work
produces the trust boundary around that experience: real authentication,
authorization, persistence, API contracts, frontend API adapters, integration
adapters, monitoring, backend services, and operational rules.

Both tracks work in the codebase. The separation is by concern, not by job
title or team boundary.

## Operating model

The app should support multiple levels of realness without rewriting the
experience layer:

```txt
local       -> browser-only services, fixture/local data, no real secrets
dev         -> real app code with dev services and sandboxed dependencies
staging     -> staging services and contract-equivalent integrations
production  -> production services, credentials, monitoring, and data
```

Local mode remains valuable after connected modes exist. It supports design
iteration, demos, edge-case testing, onboarding, and bug reproduction. The
experience track stops at local adapters. Once the app crosses into real auth,
real persistence, networked APIs, contract mapping, secret-bearing
integrations, or production observability, that work belongs to the foundation
track even when the code lives in the frontend.

## Two axes of mode

Do not collapse all environment behavior into one variable. There are two
separate decisions:

```txt
Runtime mode      = where the app is running
Capability mode   = which implementation backs a specific port
```

Examples:

```txt
runtimeMode=dev, authCapability=api, dataCapability=local
runtimeMode=staging, authCapability=api, dataCapability=api
runtimeMode=local, authCapability=local, dataCapability=local
```

The governing rule is that mode selects adapter registration, not component
logic. Components and feature hooks should not branch on persistence type,
vendor SDK, deployment environment, or mock-vs-real state.

## Frontend structure

The frontend boundary has four parts:

```txt
domain/       shared product types
ports/        TypeScript interfaces consumed by feature/application code
adapters/     concrete implementations, such as local, HTTP, or vendor-backed
services/     composition root and provider that register the chosen adapters
```

Use this flow:

```txt
UI / route / feature hook
  -> useServices()
  -> port interface
  -> adapter selected by makeServices(runtime/capability config)
```

Feature code should target the port behavior. It should not import Axios,
IndexedDB, MSW handlers, generated clients, or vendor SDKs directly.

## Local adapters and MSW

Local adapters are the primary browser-only implementation of app behavior.
They sit behind the same ports as API adapters and may use memory,
localStorage, IndexedDB, or fixture data. Local adapters are the outer edge of
experience work.

API adapters are foundation work in the frontend. They translate between
frontend ports and real HTTP contracts, normalize backend errors, preserve
auth/session behavior, and protect feature code from wire-shape and vendor
changes.

MSW still has a role, but it is not the main app architecture boundary:

```txt
Local adapters   -> product behavior in local mode
API adapters     -> product behavior backed by HTTP services
MSW handlers     -> request interception for tests, stories, executable scenarios,
                    and API-contract simulation
```

When behavior must match between local and real modes, test that behavior at
the port level or through equivalent user-facing flows. Do not rely on an MSW
handler as the only definition of product behavior.

## Contract boundary

OpenAPI is the HTTP contract between frontend API adapters and Go REST
handlers.

Frontend domain ports are not required to expose the exact HTTP wire shape.
API adapters map between OpenAPI request/response shapes and the frontend
domain types. For example, a handler may return `{ data: user }` while the
`AuthProvider.getCurrentUser()` port returns `User | null`.

Contract changes should be made in this order:

1. Update OpenAPI.
2. Update backend handlers/use cases/repos.
3. Update frontend API adapters and tests.
4. Keep local adapters behaviorally equivalent where the behavior matters.

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

Frontend example:

```txt
DiscussionStore port
IndexedDbDiscussionStore adapter
ApiDiscussionStore adapter
makeServices(config) constructor/composition root
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

## Secrets and browser code

Frontend build tools expose selected environment variables to browser bundles.
Vite exposes configured prefixes, and similar frameworks inline public
variables into JavaScript. Browser code may use public identifiers and
publishable keys, but never secrets.

Secret-bearing integrations belong behind a backend or BFF endpoint. This is
one reason feature code should depend on ports instead of importing vendor SDKs
directly.

## Testing guidance

Use TDD for behavior changes:

```txt
Red      -> add or update a failing test for the desired behavior
Green    -> implement the smallest useful change
Refactor -> clean up while keeping the tests green
```

For AI-DLC boundaries, prefer tests that prove the contract at the right layer:

- port/provider tests for frontend service behavior
- local adapter tests for browser-only persistence and authorization behavior
- API adapter tests for wire-shape mapping
- backend use-case tests for business rules
- repository tests for persistence behavior
- handler/contract tests for HTTP shape and status mapping

Effort folders under `efforts/` are work logs. Durable guidance belongs in
`agent-docs/`.
