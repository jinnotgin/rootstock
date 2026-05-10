# 📡 API Layer

For Rootstock work, feature code consumes domain ports through the service
provider. It does not import concrete HTTP calls directly. Keep Axios/fetch,
generated OpenAPI clients, cookie/session behavior, backend error mapping, and
wire-shape mapping inside API adapters. See
[`../rootstock-architecture/index.md`](../rootstock-architecture/index.md) for
the ports, adapters, composition-root, and OpenAPI contract model.

The current sample follows this shape:

```txt
feature hook
  -> useServices()
  -> port interface
  -> local adapter or API adapter selected by makeServices(config)
  -> API client / OpenAPI wire shape only inside the API adapter
```

### Use Ports As The Feature Boundary

Feature API files may still export query options, mutation hooks, schemas, and
React Query integration, but their fetcher functions should accept a port such
as `DiscussionStore`, `CommentStore`, or `AuthProvider`. They should not call
the shared HTTP client directly.

Example shape:

```ts
export const getDiscussions = (
  discussions: DiscussionStore,
  page = 1,
) => discussions.listDiscussions(page);
```

This keeps the product experience stable while runtime and capability modes
switch between local and API-backed implementations.

### Use A Single API Client Inside API Adapters

When the API adapter interacts with REST or GraphQL APIs, use a single
preconfigured API client. Native fetch, [axios](https://github.com/axios/axios),
[graphql-request](https://github.com/prisma-labs/graphql-request), and similar
clients are fine implementation details as long as they stay behind the adapter
boundary.

[API Client Example Code](../../reference/frontend/src/lib/api-client.ts)

### Keep Wire Shapes Out Of Feature Code

OpenAPI request and response shapes belong at the API adapter boundary. The
adapter maps those shapes to frontend domain types and port return values. A
backend handler might return `{ data: user }`, while the auth port returns
`User | null`.

Every API-backed adapter operation should make these responsibilities explicit:

- call the shared API client or generated OpenAPI client
- translate request and response wire shapes
- normalize backend errors for feature code
- preserve auth/session behavior
- satisfy the same port contract as the local adapter

Feature hooks can then use [react-query](https://tanstack.com/query),
[swr](https://swr.vercel.app/), or equivalent tooling for cache and mutation
state without binding the feature to a specific backend.

[API Request Declarations - Query - Example Code](../../reference/frontend/src/features/discussions/api/get-discussions.ts)
[API Request Declarations - Mutation - Example Code](../../reference/frontend/src/features/discussions/api/create-discussion.ts)
