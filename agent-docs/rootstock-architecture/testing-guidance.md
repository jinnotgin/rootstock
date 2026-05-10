## Testing guidance

Use TDD for behavior changes:

```txt
Red      -> add or update a failing test for the desired behavior
Green    -> implement the smallest useful change
Refactor -> clean up while keeping the tests green
```

For AI-DLC boundaries, prefer tests that prove the contract at the right layer:

- port/provider tests for frontend service behavior
- local adapter tests for browser-only persistence and authorization behavior
- API adapter tests for wire-shape mapping
- test adapters for deterministic success, failure, permission, and edge-case
  behavior behind the same ports
- backend use-case tests for business rules
- repository tests for persistence behavior
- handler/contract tests for HTTP shape and status mapping

Test adapters are test-harness code, not production adapter registrations. In
frontend code they should live under `src/testing/adapters/` and be injected
through test render helpers or provider overrides. In Go backend code they
should be `_test.go` fakes/stubs that implement use-case-owned interfaces.
Real local, HTTP, repository, and vendor adapters remain in production adapter
packages.

Effort folders under `efforts/` are work logs. Durable guidance belongs in
`agent-docs/`.
