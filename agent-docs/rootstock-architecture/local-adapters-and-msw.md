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
