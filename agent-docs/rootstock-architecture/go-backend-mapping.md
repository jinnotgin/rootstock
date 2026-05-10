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
