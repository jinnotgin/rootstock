# 7. Testing

- **Unit tests**: Mock or fake interfaces defined in use cases. Test business logic in isolation.
- **Integration tests**: Run in separate container via `make compose-up-integration-test`. Test full request flows against real DB/MQ.

## Test adapters

Backend test adapters are fakes, stubs, spies, clocks, ID generators, or
in-memory repositories used only by tests. They should implement interfaces
owned by the consumer package, usually `internal/usecase`, and should live in
`_test.go` files or dedicated test-helper packages that are not part of the
production composition root.

Do not put backend test adapters in production repository or client adapter
packages. A SQLite repository, external API client, or controller is a real
adapter. An in-memory repository used to force a use-case branch is a test
adapter.

```txt
internal/usecase/
  auth.go                 # use case and required interfaces
  auth_test.go            # behavior tests
  test_adapters_test.go   # fakes/stubs implementing use-case interfaces

internal/repo/sqlite/
  repo.go                 # production repository adapter
  repo_test.go            # repository behavior against real SQLite
```

Use repository integration tests when the persistence behavior itself matters.
Use test adapters when the use case only needs controlled collaborator
behavior.
