# Agent Instructions

This project uses the Rootstock philosophy: experience-first,
foundation-backed work with explicit experience/foundation boundaries.

At the start of work, check for a root `.persona` file. If it exists and says
`experience`, then:
- stay within experience scope only: screens, flows, copy, states, components,
fixtures, local adapters, and user-facing tests.
- do not perform foundation work such as real auth, persistence, API contracts,
backend services, production integrations, secrets, monitoring, or security 
hardening.

---

## TDD

Use TDD red/green/refactor for all coding changes that introduce or modify behavior.

TDD may be skipped only for trivial changes — typo fixes, comment edits,
import reordering, config tweaks, or other adjustments that carry no
behavioral risk. When in doubt, write the test.

---

## Effort Logging

Every piece of work must be tied to an effort under `efforts/`. Effort docs
exist because code shows what was built, but not what was considered, rejected,
or left open.

### Locating or creating an effort

1. Locate the relevant effort folder at `efforts/YYYY-MM-DD-<effort-slug>/`.
2. If no effort folder exists for the current work, create one with this
   structure:

```
efforts/YYYY-MM-DD-<effort-slug>/
  scope.md
  experience-implementation-plan.md
  experience-decisions.md
  experience-progress.md
  foundation-implementation-plan.md
  foundation-decisions.md
  foundation-progress.md
  open-questions.md
```

Only create the files relevant to the persona. Experience-scoped work does
not need foundation files, and vice versa.

### What each file is for

**`scope.md`** — Overall effort boundary. What is in scope, what is out of
scope, shared interfaces, assumptions, and constraints both sides must
respect. Not an execution plan.

**`experience-implementation-plan.md`** — Planned visible product work:
screens, flows, states, local adapters, fixtures, component composition,
port usage, experience-facing tests.

Structure the plan as vertical slices (end-to-end user stories), ordered by
dependency: a slice that others depend on comes first. Once ordered, implement
each slice fully before starting the next.

**`experience-decisions.md`** — Choices about visible behavior: why a flow
works a certain way, why a state was added or removed, what was picked over
alternatives. Each entry records what was decided, why, and what was
rejected. Also captures what the experience side needs from foundation and
what should not change without experience review.

**`experience-progress.md`** — Causal timeline of how visible work evolved.
Not a status report. A sequence of what happened and why it happened in
that order. Example:

```
## 2026-05-08

10:00 — Started with static form screen using Card, Input, Select from
design system. Goal: validate layout before introducing multi-step flow.

10:45 — Split into three steps. Discovered step navigation needs to
preserve draft state across steps. Logged in open-questions.md.

14:15 — Submission confirmation: changed "submitted" to "received" since
processing takes days. Reasoning in experience-decisions.md.
```

**`foundation-implementation-plan.md`** — Planned trust-boundary work: API
contracts, real adapters, backend services, persistence, auth,
authorization, monitoring, deployment, contract tests, hardening.

Structure the plan as vertical slices (end-to-end user stories), ordered by
dependency: a slice that others depend on comes first. Once ordered, implement
each slice fully before starting the next.

**`foundation-decisions.md`** — Choices about invisible infrastructure: why
an interface was shaped a certain way, security constraints that affect the
product. Also captures what foundation needs from experience (e.g. "approve
simplified status mapping", "write copy for ineligible state").

**`foundation-progress.md`** — Causal timeline of invisible work: when mock
providers were replaced, schema changes, real integrations connected,
constraints discovered that affect experience.

**`open-questions.md`** — Unresolved items, tagged by who can resolve them:

```
[experience]  Should incomplete items auto-save or require explicit save?
[foundation]  What is the maximum attachment size the API accepts?
[both]        What happens when session expires mid-flow?
```

### Mock/real boundary

Every effort should explicitly state what is currently real and what is
mocked. Keep this at the top of the relevant progress file or as a standing
section in `open-questions.md`:

```
Currently real:
- Front-end routes, design system components, local validation

Currently mocked:
- Auth (MockAuthProvider), persistence (IndexedDbStore)

Expected replacement:
- MockAuthProvider → RealAuthProvider
- IndexedDbStore → ApiStore
```

### When to update
- Update the docs incrementally along the way, after a milestone, rather than at the end.

### How to update

- Update progress logs incrementally as meaningful steps land, not at the
  end of a session.
- Entries must be concrete: "added failing test for login redirect",
  "component renders empty state" — not "made progress on auth".
- Log decisions when they are made, including what was rejected and why.
- Add open questions the moment they surface, tagged appropriately.
- Do not document what is already clear from code — names, types, props,
  small styling tweaks. Document intent, trade-offs, sequencing,
  assumptions, and unresolved questions.

---

## Reference Material

When `frontend/` or `backend/` is empty, missing structure, or lacks clear
patterns for a feature, refer to `agent-reference/frontend/` or
`agent-reference/backend/` for project layout, patterns, and methodology.
Adopt the structure and approach, not necessarily the content verbatim.

If `frontend/` is empty, follow `.agents/skills/seed-frontend.md` to bootstrap
the component library, config, and app shell from the reference implementation
before starting feature work.

Use the durable docs for details:

- Rootstock architecture: `agent-docs/rootstock-architecture/index.md`
- Frontend guidance: `agent-docs/frontend-practices/`
- Backend guidance: `agent-docs/backend-practices/index.md`
- Effort docs: `efforts/YYYY-MM-DD-<effort-slug>/`
