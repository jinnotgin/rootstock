---
name: seed-empty-frontend
description: >-
  Bootstrap an empty frontend/ directory from the agent-reference implementation.
  Copies the UI component library, build tooling, and app shell while leaving
  feature-specific modules for fresh, per-project creation.
  Use when frontend/ is empty or missing structure and needs to be scaffolded
  from agent-reference/frontend/.
metadata:
  author: Jin
  version: "1.0"
---

# Skill: Seed Empty Frontend

Use this skill when `frontend/` is empty or missing structure and you need to
bootstrap it from the reference implementation.

The source for all copies is `agent-reference/frontend/`. Adopt the structure
and approach — do not copy feature-specific content verbatim.

## Source

All files originate from `agent-reference/frontend/`.

---

## Step-by-step Instructions

### 1. Verify the target is empty

Confirm that `frontend/` is missing or has no meaningful structure before proceeding.
If files already exist, stop and ask the user whether to overwrite or merge.

### 2. Copy files in tier order

Copy from `agent-reference/frontend/` in the following priority.

#### Tier 1 — UI component library (minimum viable seed)

| Source | Purpose |
|--------|---------|
| `src/components/` | Full component library: `ui/`, `layouts/`, `errors/`, `seo/` |
| `src/utils/` | `cn.ts` (class merging) and `format.ts` — depended on by nearly every component |
| `src/index.css` | Global Tailwind CSS; components are unstyled without this |

#### Tier 2 — Config and tooling (needed to install and build)

| Source | Purpose |
|--------|---------|
| `package.json` | All dependencies (React, Tailwind, Radix UI, etc.) |
| `vite.config.ts` | Build setup, `@/*` path alias, Tailwind plugin |
| `tsconfig.json` | TypeScript config including `@/*` path alias |
| `index.html` | HTML entry point |
| `components.json` | Shadcn component config |
| `.prettierrc` | Formatting config |
| `eslint.config.js` | Lint config |
| `.gitignore` | Standard ignores: macOS, node_modules, build output, env files, logs, editors |

#### Tier 3 — App shell (needed to render anything)

| Source | Purpose |
|--------|---------|
| `src/main.tsx` | React entry point |
| `src/app/` | Router, providers, and app root |
| `src/lib/` | `auth.tsx`, `react-query.ts`, `api-client.ts` |
| `src/config/` | `env.ts`, `paths.ts` |
| `src/types/` | Shared API and domain types |
| `src/hooks/` | `use-disclosure.ts`, `use-mobile.ts` |
| `src/assets/` | Images and fonts |
| `public/` | Favicon, `mockServiceWorker.js`, other static assets |

#### Optional (copy if the project adopts these)

| Source | Purpose |
|--------|---------|
| `src/testing/` | MSW setup, vitest helpers, data generators |
| `e2e/` | Playwright E2E tests |
| `.storybook/` | Storybook component development environment |

### 3. Do NOT copy these directories

These are reference feature implementations — create them fresh per project.

- `src/features/` — feature modules (auth, discussions, comments, users, teams)
- `src/adapters/` — HTTP and local adapter implementations
- `src/ports/` — port interface definitions
- `src/domain/` — domain types
- `src/services/` — service wiring and bootstrap

### 4. Post-copy adjustments

1. Update `package.json` name, version, and description.
2. Remove or replace fixture/demo content inside `src/app/routes/`.
3. Define new ports in `src/ports/` that match the project's domain.
4. Create a local adapter in `src/adapters/local/` before wiring any real API.
5. See `agent-docs/rootstock-architecture/index.md` for the ports/adapters model.

---

## Common Edge Cases

- **Partial frontend exists**: If some structure is already present, diff against the reference and copy only missing pieces. Do not overwrite user work.
- **Dependency conflicts**: After copying `package.json`, run `npm install` (or the project's package manager) and resolve any version conflicts before proceeding.
- **Path alias mismatch**: Ensure both `vite.config.ts` and `tsconfig.json` agree on the `@/*` path alias. A mismatch causes import resolution failures.