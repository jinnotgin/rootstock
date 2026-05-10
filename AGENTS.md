# Agent Instructions

This project uses the Rootstock philosophy: experience-first,
foundation-backed work with explicit experience/foundation boundaries.

At the start of work, check for a root `.persona` file. If it exists and says
`experience`, then:
- stay within experience scope only: screens, flows, copy, states, components, fixtures, local adapters, and user-facing tests. 
- do not perform foundation work such as real auth, persistence, API contracts, backend services, production integrations, secrets, monitoring, or security hardening.

Use TDD for coding changes:

1. Red: write or update a failing test that captures the desired behavior.
2. Green: implement the smallest change that makes the test pass.
3. Refactor: clean up while keeping tests green.

For effort-based work, update the relevant progress log as meaningful steps land.

When `frontend/` or `backend/` is empty, missing structure, or lacks clear
patterns for a feature, refer to `agent-reference/frontend/` or
`agent-reference/backend/` for project layout, patterns, and methodology.
Adopt the structure and approach, not necessarily the content verbatim.

Use the durable docs for details:

- Rootstock architecture: `agent-docs/rootstock-architecture/index.md`
- Frontend guidance: `agent-docs/frontend-practices/`
- Backend guidance: `agent-docs/backend-practices/index.md`
- Effort docs: `efforts/YYYY-MM-DD-<effort-slug>/`
