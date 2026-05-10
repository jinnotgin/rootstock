# 5. Domain Reference

Three domains are implemented, each spanning all four transports:

| Domain | Use Case Struct | Key Behavior |
|--------|-----------------|--------------|
| **Auth** | `UserUseCase` | Register, login, JWT auth, profile retrieval. Bcrypt passwords. |
| **Tasks** | `TaskUseCase` | CRUD + status state machine (`todo` → `in_progress` → `done`). User-scoped. Paginated. |
| **Translation** | `TranslationUseCase` | Translate via external API, persist history. |

When adding a new domain:

1. Define entities in `internal/entity/`.
2. Create use case struct + interface in `internal/usecase/`.
3. Implement repo in `internal/repo/persistent/` or `internal/repo/webapi/`.
4. Add controller handlers in each transport's `v1/` directory.
5. Wire everything in `internal/app/app.go`.
