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
