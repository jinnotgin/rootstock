# Rootstock: Experience-first, foundation-backed

## A note on roles

This document does not name specific roles (designer, engineer, product manager, etc.). In an AI-assisted development life cycle (AI-DLC), the boundaries between who does what are shifting. LLM tools allow people with different backgrounds to contribute across traditional role lines.

What matters is the *type of work* being done, not the job title of who does it. The two types of work are described below as experience work and foundation work. A single person may do both. A team may split them. The separation is about concern, not headcount.

In all cases, the work happens in the codebase: directly or through LLM tools that produce code.

---

## What this is

Rootstock is a working model for teams where experience work (screens, flows, states, copy, interaction behavior) is built and iterated using LLM tools, while foundation work (auth, persistence, authorization, integrations, security, data integrity) is owned separately and connected progressively.

The front end starts in a fully local mode and later connects to real services without rewriting the product experience.

---

## Assumptions

Everyone contributing to experience or foundation work operates in the codebase. There is no separate design-only or spec-only track. Contributors work directly with code or through LLM tools that produce code.

Both layers produce working code. Experience work produces running front-end code: components, routes, states, fixtures, local data. Foundation work produces the backend implementations those components connect to. The output at every stage is something that runs, not a document or a static mockup.

---

## Two layers

Rootstock separates the product into an experience layer and a foundation layer.

The **experience layer** is what the user sees and touches: screens, flows, components, copy, states, layout, feedback, interaction behavior. This layer is built as running front-end code, not just wireframes or design files.

The **foundation layer** is what makes the product trustworthy: authentication, authorization, persistence, data integrity, audit trails, security rules, backups, APIs, monitoring, operational reliability.

Both layers shape the same product from different risk perspectives.

---

## App modes

Rootstock apps should support running at different levels of real-ness. The boundary between "mocked" and "real" moves progressively, and the architecture should support any point on that spectrum.

```
local       → all mocked, browser-only (memory, localStorage, IndexedDB, fixture data)
dev         → real auth, dev database, mock third parties
staging     → staging auth, staging APIs, sandbox integrations
production  → real auth, production APIs, real integrations
```

Local mode is useful for prototypes, demos, design validation, usability testing, onboarding, and AI-assisted iteration.

Connected modes (dev, staging, production) progressively introduce real identity, real persistence, and real third-party integrations. As more services become real, Rootstock moves from a designed experience to part of a trusted system.

Local mode should stay alive even after connected modes exist. It remains valuable for design iteration, testing edge cases, sales demos, new teammate onboarding, and reproducing bugs.

### Two axes, not one

Environment switching has two separate dimensions. The first is deployment mode: where the code runs (local machine, dev server, staging environment, production). The second is capability mode: which ports are mocked, sandboxed, or fully real. These do not always move together. A dev deployment might mock a third-party API. A staging deployment might use sandbox credentials for some services and real credentials for others.

The capability mapping for a typical project looks like this:

| Port | Local | Dev | Staging | Production |
|---|---|---|---|---|
| Auth | Fixture user, mock session | Real auth, dev tenant | Real auth, staging tenant | Real auth, production tenant |
| Data store | Memory or IndexedDB | Real API, dev database | Real API, staging database | Real API, production database |
| Third-party APIs | Request interceptors, fixture responses | Sandbox or dev credentials | Staging credentials | Production credentials |
| Feature flags | In-memory defaults | Flag provider, dev environment | Flag provider, staging | Flag provider, production |
| Monitoring | Console or no-op | Dev tracing | Staging tracing and alerting | Full tracing and alerting |

The governing rule: mode selects adapter registration, not component logic. Components never branch on vendor names or persistence types. A single registration point maps the current mode and capabilities to the correct adapters. That preserves the same experience layer while the foundation layer becomes progressively real.

### Environment variables and secrets

Frontend build tools (Vite, Next.js, and similar) expose prefixed environment variables to client-side code. Vite exposes variables with a configured prefix; Next.js inlines `NEXT_PUBLIC_` values into the JavaScript bundle. This means browser adapters can safely use publishable keys and public identifiers, but never secrets. Secret-bearing third-party integrations belong behind a backend or BFF endpoint, even if the experience layer is developed locally first. This is one reason components should depend on ports, not on vendor SDK calls.

---

## Core architectural principle

The same Rootstock front-end code should run against any mode. UI components should not know whether they talk to IndexedDB, Supabase, SingPass, or fixture data.

The app depends on stable interfaces:

```ts
interface AuthProvider {
  getCurrentUser(): Promise<User | null>
  signIn(): Promise<void>
  signOut(): Promise<void>
}

interface ProjectStore {
  listProjects(userId: string): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  saveProject(project: Project): Promise<Project>
  deleteProject(id: string): Promise<void>
}
```

Implementations are swapped behind adapters:

```
MockAuthProvider         → SingPassAuthProvider
IndexedDbProjectStore    → ApiProjectStore
InMemoryFlagProvider     → OpenFeatureFlagProvider
```

Components stay the same. The foundation implementation changes.

### The composition root

The mechanism that makes adapter swapping work is a composition root: a single place in the codebase where the current mode is read and the correct adapters are constructed. Components never import adapters directly. They receive services through context and hooks.

```ts
// src/app/bootstrap/services.ts

export async function makeServices(mode: RuntimeMode): Promise<AppServices> {
  if (mode === "local") {
    return {
      auth: new MockAuthProvider(),
      projects: new IndexedDbProjectStore(),
      flags: new InMemoryFlagProvider(),
      monitor: new ConsoleMonitor(),
    }
  }

  return {
    auth: new SingPassAuthProvider(),
    projects: new ApiProjectStore(),
    flags: new OpenFeatureFlagProvider(),
    monitor: new ProductionMonitor(),
  }
}
```

```tsx
// App entry
const services = await makeServices(currentMode)

<AppServicesProvider value={services}>
  <App />
</AppServicesProvider>
```

This keeps registration auditable. Storybook stories and test harnesses can override services by replacing the provider value. AI-generated code targets the port interfaces, not vendor SDKs, which constrains the vocabulary LLM tools work with and prevents vendor lock-in from leaking into experience code.

For most frontend teams, React context and provider hooks are sufficient for this wiring. DI containers (InversifyJS, TSyringe, etc.) are legitimate options for larger dependency graphs, but they bring metadata and decorator setup that adds indirection. Start with the explicit factory and move to a container only when the dependency graph justifies it.

---

## Project structure

```
src/
  app/
    bootstrap/
      env.ts                        # reads environment variables
      mode.ts                       # determines runtime mode
      services.ts                   # composition root
    providers/
      AppServicesProvider.tsx        # React context provider
      useServices.ts                # hook to consume services
    routes/

  domain/
    types/                          # shared domain types (User, Project, etc.)

  ports/
    auth.ts
    project-store.ts
    flags.ts
    monitor.ts

  adapters/
    auth/
      mock.ts
      singpass.ts
    project-store/
      memory.ts
      indexeddb.ts
      api.ts
    flags/
      in-memory.ts
      openfeature.ts
    monitor/
      console.ts
      production.ts
    http/
      client.ts                     # shared HTTP client config
      generated/                    # OpenAPI-generated types/clients

  mocks/
    handlers.ts                     # MSW request handlers
    browser.ts                      # MSW browser worker setup
    fixtures/                       # scenario fixture data

  stories/                          # component and page stories (optional)

  test/
    unit/
    integration/
    contract/
    e2e/

efforts/
  <date>-<effort>/
    experience-decisions.md
    experience-progress.md
    foundation-decisions.md
    foundation-progress.md
    open-questions.md
```

Two choices here are intentional. First, `ports/` is separate from `adapters/`, so generated clients, vendor SDKs, and browser APIs never become the de facto domain interface. Second, `app/bootstrap/services.ts` acts as the single registration point for all adapter resolution. This prevents service-locator drift, where feature code reaches into a global registry for its dependencies instead of receiving them through the provider tree.

---

## Seed the design system first

Before anyone starts building flows with LLM tools, the codebase owner should seed a basic design system: Button, Input, Select, Modal, Card, Table, Alert, EmptyState, PageHeader, and so on, along with spacing, typography, color, and layout tokens.

This gives both the human and the AI agent a safe vocabulary. Instead of generating random UI each time, the AI composes from approved primitives:

```tsx
<Button variant="primary" />
<Card />
<Alert tone="warning" />
<EmptyState />
```

This keeps generated code aligned with the product's visual language and makes later foundation hardening much easier because the app is built from known parts.

### Registries for AI grounding

When AI tools generate UI code, they need to know what primitives exist and how they should be composed. A design system registry serves this purpose: it is a structured specification that passes component metadata, props, usage rules, and constraints to the AI model. This is the mechanism behind the principle of "composing from approved primitives." Without a registry or equivalent context, LLM tools tend to invent components or misuse existing ones.

The registry can be a dedicated configuration (like a component manifest or schema file), inline documentation within the component files themselves, or explicit AI-facing rules in the codebase. The format matters less than the fact that the AI has structured access to the design vocabulary.

### Bridging design system usage

Teams benefit from a way to view and interact with design system components in isolation: seeing each component's states, variants, edge cases, and composition patterns outside of the full application. Storybook is the most mature tool for this. It can serve as a living reference for both humans and AI tools, showing how components should be used, what states they support, and how they compose together. Its addon ecosystem supports request mocking, accessibility checks, and automated visual documentation.

That said, Storybook is one approach to this problem, not the only one. Some teams use fixture-driven dev pages, scenario switchers baked into the app's local mode, or purpose-built component playgrounds. The requirement is that the design system is demonstrable and browsable in isolation. The specific tool is a team decision.

---

## Experience scope

Experience work is about shaping the user-facing product: updating screens, flows, forms, copy, empty/loading/error states, navigation, component composition, and demo data.

Experience work also includes defining realistic scenarios as fixtures:

```
new user with no records
user waiting for SingPass verification
user with expired session
admin user vs non-admin user
save failure
permission denied
```

These turn design intent into executable examples. The output is a working front end that runs locally.

Traditional artefacts like static screens, design files, and specification documents can still be used. They become the materials for the final output: a working front end.

### Making fixtures executable

Scenario fixtures are most useful when they can be run, not just read. Request interceptors like MSW (Mock Service Worker) make this possible by intercepting network requests at the service-worker level and returning fixture responses. Components make real fetch or API calls; the interceptor catches them and responds with scenario data. This means the same component code works in local mode (intercepted) and connected mode (real network) without conditional logic.

The same request handlers can run in the browser during development, in Node during tests, and in a component workshop during design review. This is the closest the current ecosystem gets to treating the front end as an executable experience spec.

The core experience questions:

```
What does the user see?
What can the user do?
What happens next?
What does success look like?
What happens when something is empty, loading, invalid, or failed?
What does each user role experience?
```

---

## Foundation scope

Foundation work is about making the product real, safe, and reliable: owning real auth integration, API contracts, database schema, server-side validation, authorization rules, row-level security, audit logging, data migrations, backup, monitoring, deployment, and security reviews.

The core foundation questions:

```
Who is the user really?
What are they allowed to do?
Where is the source of truth?
Can the client be trusted?
What happens if the network fails?
What happens if two users edit at once?
How are secrets protected?
How do we observe failures?
```

---

## Handoff model

The handoff is: "here is a working front end with domain types, service interfaces, mock implementations, and scenario fixtures. Replace the mock adapters with real adapters and harden the trust model."

### Directional handoff

Each effort produces two directions of communication.

**Experience → Foundation** says: here is the intended product experience, here are the mock assumptions, here is what needs real backend support. It covers visible intent, user-facing changes, important user journeys, current mock assumptions, code pointers, specific foundation asks, and things that should not change without experience review.

**Foundation → Experience** says: here are the constraints that affect the product experience, here are the decisions needed before hardening. It covers invisible constraints (e.g. "client-side application status cannot be trusted"), real states the backend expects (which may be more granular than the mock states), differences from current mocks, risks, recommendations, and specific experience asks.

In the effort folder, these two directions are captured in their respective decision and progress files rather than a single handoff document. `experience-decisions.md` includes what the experience side needs from foundation. `foundation-decisions.md` includes what the foundation side needs from experience. The exchange is embedded in the working documents, not separated into a one-time handoff artifact.

---

## Effort documentation

### Principle

The codebase explains what exists. Effort docs explain why it changed, what was considered, what remains unresolved, and how the two sides are coordinating.

This structure follows the same reasoning behind Architecture Decision Records (ADRs): code shows what was built, but not what was considered, rejected, or left open. The effort folder is an extension of ADR practice, scoped to a specific body of work and split across experience and foundation concerns.

As much as possible, these documents should be auto-generated behind-the-scenes by AI agents, as part of using AI agents to perform tasks. This is known as "ambient documentation." Good automation targets include updating progress files from PR metadata, flagging open questions when adapter registrations change, and generating component documentation from stories and type definitions. The goal is documentation that stays current because it is a byproduct of work, not a separate obligation.

### Terminology

The doc uses two terms to separate concerns:

**Experience** refers to the visible product layer: screens, flows, states, copy, interaction behavior, component composition.

**Foundation** refers to the invisible infrastructure layer: auth, persistence, authorization, integrations, security, data integrity.

### Structure

```
efforts/
  2026-05-08-grant-application/
    scope.md
    experience-implementation-plan.md
    experience-decisions.md
    experience-progress.md
    foundation-implementation-plan.md
    foundation-decisions.md
    foundation-progress.md
    open-questions.md
```

### File responsibilities

`scope.md` records the overall effort boundary: what is in scope, what is out
of scope, the shared public interfaces, assumptions, and constraints that both
experience and foundation work need to respect. It should not become a
step-by-step execution plan.

`experience-implementation-plan.md` records the planned visible product work:
screens, flows, states, local adapters, scenario fixtures, component
composition, frontend port usage, and experience-facing tests. It should focus
on what the user sees and how local mode expresses the intended product
behavior.

`experience-decisions.md` records choices made about visible behavior: why a flow works a certain way, why a state was added or removed, what copy direction was chosen, what interaction pattern was picked over alternatives. Each entry should include what was decided, why, and what was rejected. This file also captures what the experience side needs from foundation (e.g. "confirm whether application status values match real API states") and what should not change without experience review (e.g. step order, user-facing labels, CTA placement).

`experience-progress.md` records the causal sequence of how visible work evolved. Not a status report. A timeline of what happened and why it happened in that order.

Example:

```
# Experience progress: Grant application

## 2026-05-08

10:00 — Started with a static application form screen using Card, Input, Select,
and PageHeader from the design system. Goal was to validate the basic layout and
field grouping before introducing multi-step flow.

10:45 — Split into three steps: eligibility check, project details, supporting
documents. Discovered that step navigation needs to preserve draft state across
steps. Logged in open-questions.md.

14:15 — First pass at submission confirmation screen. "Your application has been
submitted" felt premature since processing takes days. Changed to "Your application
has been received. We'll update you within 10 working days." Reasoning captured
in experience-decisions.md.
```

`foundation-implementation-plan.md` records the planned trust-boundary work:
API contracts, real adapters, backend services, persistence, auth,
authorization, monitoring, deployment, contract tests, and hardening. It should
focus on how the experience becomes real, safe, reliable, and observable.

`foundation-decisions.md` records choices made about invisible infrastructure: why an interface was shaped a certain way, why a particular auth flow was chosen, what security constraints affect the product. Each entry should include what was decided, why, and what was rejected. This file also captures what the foundation side needs from experience (e.g. "approve simplified status mapping for the UI," "write copy for ineligible applicant state," "decide whether incomplete applications can be resumed").

`foundation-progress.md` records the causal sequence of how invisible work evolved: when mock providers were replaced, when schema changed, when a real integration was connected, when a constraint was discovered that affects the experience layer.

`open-questions.md` captures what is unresolved on either side. Each entry should be tagged with who can resolve it (experience, foundation, or both).

Example:

```
[experience]  Should incomplete applications be auto-saved or require explicit save?
[foundation]  Can one user have multiple draft applications?
[both]        What happens when SingPass session expires mid-application?
[foundation]  What is the maximum attachment size the API accepts?
[experience]  What confirmation does the user see after submission?
```

### Mock/real boundary

Every effort should explicitly state what is real and what is mocked. This can live at the top of either progress file, or as a standing section in `open-questions.md`.

```
Currently real:
- Front-end routes, design system components, local validation, demo flows

Currently mocked:
- SingPass authentication, application status API, server persistence

Expected replacement:
- MockAuthProvider → SingPassAuthProvider
- IndexedDbStore → ApiStore
- InMemoryFlagProvider → OpenFeatureFlagProvider
```

This prevents confusing "it works" with "it is real."

### What not to document

Do not document every component prop, every file, every small styling change, or anything already clear from names, types, and tests. Document the things code cannot convey: intent, trade-offs, sequences, assumptions, and unresolved questions.

---

## Testing

Tests in Rootstock serve a specific purpose beyond general quality: they are what prevent the experience and foundation layers from silently diverging as each side evolves.

Four layers of testing serve different concerns:

**Unit tests** target application services and business logic against fake adapters. They run fast, with no network and no browser, and verify that domain logic behaves correctly regardless of the adapter behind it.

**Integration tests** run real UI components against mock adapters (MSW handlers, memory stores, fixture data). They verify that screens behave correctly with expected data shapes and that the experience layer handles all documented scenario states: empty, loading, success, failure, permission denied.

**Contract tests** verify that real adapters conform to port interfaces and that API responses match expected schemas. These are the primary guard against mock drift. When request interceptors and fixture data are the source of truth during experience work, contract tests are what catch the moment a real API diverges from those assumptions. Consumer-driven contract tools like Pact are effective here because the experience team's tests produce a contract that the foundation team's API can verify against independently.

**End-to-end tests** run the full app against a real or staging backend. They verify critical user paths across the full stack. Run them across environment modes using CI matrix jobs so the same test suite executes against different adapter registrations and base URLs.

The most common failure in this model is not a lack of tests but a lack of contract tests. Unit and integration coverage can be green while the real API has quietly changed shape. Contract tests close that gap.

---

## Failure modes and prevention

| Failure mode | Prevention |
|---|---|
| UI not based on the design system | Seed the design system before building flows; use a registry or equivalent context to ground AI generation |
| Mock data shapes not matching real data | Define domain types and service interfaces early |
| Mock data shapes drifting from real API over time | Add contract tests at adapter boundaries; validate against OpenAPI schemas |
| Components calling a specific backend vendor directly | Keep vendor-specific code out of components; depend on ports, not SDKs |
| Auth assumptions hardcoded into the UI | Keep mocks behind adapter interfaces |
| Client-side roles trusted as real permissions | Keep mocks behind adapter interfaces |
| Secrets exposed in browser adapters | Keep secret-bearing integrations behind a backend or BFF; never put secrets in prefixed environment variables |
| Missing error, loading, and offline states | Document scenarios as fixtures; make them executable with request interceptors |
| Those doing foundation work unable to tell which behavior is intentional | Treat the front end as an executable spec; foundation work replaces implementations, not experiences |

---

## Summary

Experience work can move fast with LLM tools: visible behavior, local state, demo data, screen flows, component composition, copy, interaction design.

Foundation involvement is needed for: real identity, real personal data, shared records, permissions, databases, third-party integrations, security, compliance.

Rootstock's bridge between experience and foundation is a stable front-end contract: design system components (grounded through a registry or workshop), domain types, service interfaces, mocks, replaceable adapters, and a composition root that maps the current mode to the correct implementations. Request interceptors and scenario fixtures make local mode productive. Contract tests prevent the two layers from diverging. The effort layer preserves the context that code alone cannot carry.
