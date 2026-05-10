# Frontend

This directory is the working space for your application's frontend. It is
currently empty — no production code lives here yet.

## Temporary state

This is a placeholder. Once work begins, this directory will be populated by
copying the relevant structure from `agent-reference/frontend/` as described
in `.agents/skills/seed-frontend.md`.

## Project structure

Before writing any code, read these files to understand the expected layout and
approach:

| Document | What it covers |
|----------|---------------|
| `agent-docs/rootstock-architecture/index.md` | Ports/adapters model, experience/foundation boundary |
| `agent-docs/frontend-practices/` | Component patterns, state management, local-mode development |
| `agent-reference/frontend/` | Complete reference implementation demonstrating the full stack |
| `.agents/skills/seed-frontend.md` | Which folders to copy when bootstrapping this directory |

## Suggested technologies

Derived from the reference implementation in `agent-reference/frontend/`:

**Core**
- [React](https://react.dev) 19 — UI framework
- [TypeScript](https://www.typescriptlang.org) 6 — type safety
- [Vite](https://vitejs.dev) 8 — build tool and dev server

**Styling and UI**
- [Tailwind CSS](https://tailwindcss.com) 4 — utility-first CSS
- [shadcn/ui](https://ui.shadcn.com) — copy-paste component collection built on Radix UI
- [Radix UI](https://www.radix-ui.com) — unstyled, accessible primitives (used by shadcn/ui)
- [Lucide React](https://lucide.dev) — icon library
- [Sonner](https://sonner.emilkowal.ski) — toast notifications

**Routing and data**
- [React Router](https://reactrouter.com) 7 — client-side routing
- [TanStack Query](https://tanstack.com/query) 5 — server state and caching
- [Zustand](https://zustand-demo.pmnd.rs) 5 — client state management
- [Axios](https://axios-http.com) — HTTP client

**Forms and validation**
- [React Hook Form](https://react-hook-form.com) 7 — form state management
- [Zod](https://zod.dev) 4 — schema validation

**Testing**
- [Vitest](https://vitest.dev) 4 — unit and component tests
- [React Testing Library](https://testing-library.com/react) — component testing
- [Playwright](https://playwright.dev) — end-to-end tests
- [MSW](https://mswjs.io) 2 — API mocking

**Development**
- [Storybook](https://storybook.js.org) 10 — component development and documentation
