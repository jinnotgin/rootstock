# Agent Instructions

This project follows Rootstock philosophy: experience-first, foundation-backed, with explicit boundaries between the two. (More details here: `agent-docs/rootstock-architecture/index.md`)

At the start of work, check for root `/.persona`. If it says `experience`:
- stay within experience scope (screens, flows, copy, states, components, fixtures, local adapters, user-facing tests).
- do not perform foundation work (real auth, persistence, API contracts, backend services, production integrations, secrets, monitoring, security hardening).

---

## TDD

Use TDD red/green/refactor for all coding changes that introduce or modify behavior.

TDD may be skipped for trivial changes — typo fixes, comment edits,
import reordering, config tweaks, or other adjustments that carry no
behavioral risk. When in doubt, write the test.

---

## Effort Logging

All work maps to an effort in `efforts/YYYY-MM-DD-<effort-slug>/`.
If none exists, create one with applicable files:

```
scope.md
experience-implementation-plan.md   # experience persona only
experience-decisions.md
experience-progress.md
foundation-implementation-plan.md   # foundation persona only
foundation-decisions.md
foundation-progress.md
open-questions.md
```

### File purposes

**`scope.md`** — Boundary: in/out of scope, shared interfaces, assumptions,
constraints. Must include a mock/real boundary section stating what is
currently real, what is mocked, and planned replacements:

```
Real: front-end routes, design-system components, local validation
Mocked: auth (MockAuthProvider), persistence (IndexedDbStore)
Planned: MockAuthProvider → RealAuthProvider, IndexedDbStore → ApiStore
```

**`*-implementation-plan.md`** — Planned work as vertical slices ordered by
dependency (depended-on slices first). Complete each slice before starting
the next. Experience plans cover screens, flows, states, local adapters,
fixtures, port usage, tests. Foundation plans cover API contracts, real
adapters, services, persistence, auth, monitoring, deployment, contract
tests, hardening.

**`*-decisions.md`** — What was decided, why, and what was rejected.
Experience: visible behavior choices, needs from foundation, things that
shouldn't change without experience review. Foundation: infrastructure
choices, security constraints affecting product, needs from experience.

**`*-progress.md`** — Causal timeline of what happened and why in that order.
Entries must be concrete:

```
## 2026-05-08
10:00 — Static form screen with Card, Input, Select. Validating layout
before adding multi-step flow.
10:45 — Split into three steps; step nav needs draft preservation.
Logged in open-questions.md.
```

**`open-questions.md`** — Unresolved items tagged by owner:

```
[experience]  Auto-save incomplete items or require explicit save?
[foundation]  Max attachment size the API accepts?
[both]        Behavior when session expires mid-flow?
```

### Updating effort docs

- Update incrementally after milestones, not at end of session.
- Be concrete: "added failing test for login redirect" not "made progress."
- Log decisions when made, including rejected alternatives.
- Add open questions immediately, tagged by owner.
- Don't document what code already shows (names, types, props, minor styling).
  Document intent, trade-offs, sequencing, assumptions, unresolved questions.

---

## Reference Material

When `frontend/` or `backend/` is empty, missing structure, or lacks clear
patterns for a feature, refer to `agent-reference/frontend/` or
`agent-reference/backend/` for project layout, patterns, and methodology.
Adopt the structure and approach, not necessarily the content verbatim.

If `frontend/` is empty, follow `.agents/skills/seed-frontend.md` to bootstrap
the component library, config, and app shell from the reference implementation
before starting feature work.

Durable docs:
- Rootstock architecture: `agent-docs/rootstock-architecture/`
- Frontend: `agent-docs/frontend-practices/`
- Backend: `agent-docs/backend-practices/`
- Efforts: `efforts/YYYY-MM-DD-<effort-slug>/`
