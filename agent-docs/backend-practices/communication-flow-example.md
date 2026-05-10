# 8. Communication Flow Example

HTTP request to update a task, which also needs a DB read:

```
REST Controller     →  (interface)  →  TaskUseCase
                                        TaskUseCase  →  (interface)  →  TaskRepo (Postgres)
                                        TaskUseCase  ←                  TaskRepo
REST Controller     ←                  TaskUseCase
```

Every `→` / `←` crossing a layer boundary goes through an **interface**. No concrete type leaks between layers.
