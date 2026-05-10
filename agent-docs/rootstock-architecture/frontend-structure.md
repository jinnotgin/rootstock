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
