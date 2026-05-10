# Go Clean Architecture — Agent Guidance & Best Practices

> Reference doc for AI agents working within this codebase. Covers project structure, architectural rules, and conventions.

For AI-DLC alignment with the frontend, use cases own the Go ports they
consume, repositories and external clients are adapters, and `New...`
constructors are wiring. Constructors are the backend equivalent of frontend
composition-root registration; they are not ports themselves. See
[`../rootstock-architecture/index.md`](../rootstock-architecture/index.md).

---

This document has been split into smaller files:

- [Architecture overview](architecture-overview.md)
- [Project structure](project-structure.md)
- [Key conventions](key-conventions.md)
- [Architectural rules](architectural-rules.md)
- [Domain reference](domain-reference.md)
- [Infrastructure and config](infrastructure-and-config.md)
- [Testing](testing.md)
- [Communication flow example](communication-flow-example.md)
