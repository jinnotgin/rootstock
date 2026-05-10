# 1. Architecture Overview

This project follows **Clean Architecture** (Robert C. Martin). The core rule:

**Dependencies point inward.** Business logic never imports from outer layers.

```
Controllers (REST/gRPC/AMQP/NATS)
    ↓ calls via interface
Use Cases (business logic)
    ↓ calls via interface
Repositories / Web APIs (infrastructure)
```

There are exactly **two conceptual layers**:

| Layer | Contains | Rules |
|-------|----------|-------|
| **Inner (business logic)** | `internal/usecase`, `internal/entity` | No imports from outer layer. Use only stdlib + interfaces. |
| **Outer (tools)** | Controllers, repos, pkg, frameworks | Components are unaware of each other. Communicate only through use cases. |
