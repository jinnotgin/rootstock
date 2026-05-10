# Experience decisions: Rootstock sample app

## 2026-05-10

### Keep the existing sample domain

Decision: keep the current Bulletproof React sample domain as the working product experience:

- auth
- teams
- users
- discussions
- comments

Reasoning: the frontend already has routes, forms, lists, empty states, MSW handlers, tests, and E2E coverage for this domain. Reusing it lets the AI-DLC migration focus on architecture boundaries instead of inventing product behavior.

Rejected: switching to the backend guidance example domains of tasks and translation. Those domains exist only in documentation in this repo and would require replacing the current frontend sample experience before proving the architecture.

### Preserve local-first experience work

Decision: local mode remains a first-class way to run the product experience without the real backend.

Reasoning: the AI-DLC model depends on experience work staying runnable during foundation work. Local mode should support demos, design iteration, scenario testing, and onboarding even after the Go backend exists.

Rejected: making the Go backend mandatory for all development. That would make visible experience work depend too heavily on foundation readiness.

### Move mock/real switching out of component logic

Decision: frontend components and routes should not branch on whether data comes from IndexedDB, MSW, or the Go API. They should depend on hooks backed by stable ports.

Reasoning: the same visible product experience should run against local adapters and true backend adapters.

Rejected: keeping MSW as the only mock/real boundary. MSW remains useful, but the primary application boundary should be ports/adapters.

### Use executable scenarios

Decision: scenario fixtures should become explicit and runnable.

Initial scenarios:

- empty app
- logged-out user
- admin user
- normal user
- expired session
- permission denied
- save failure
- discussion with comments
- no comments

Reasoning: scenarios are the experience contract for foundation work. They make visible intent testable.

