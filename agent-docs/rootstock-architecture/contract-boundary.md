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
