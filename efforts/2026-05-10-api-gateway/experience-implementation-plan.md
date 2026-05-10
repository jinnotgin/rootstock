# Experience Implementation Plan: API Gateway Control Plane

## Vertical slices (in dependency order)

| # | Slice | Key screens / components |
|---|-------|--------------------------|
| 1 | App shell | Router, layouts (auth, dashboard, admin), nav, auth guards, route config |
| 2 | Login + first-login set-password | LoginForm, SetPasswordForm, auth port wired |
| 3 | View API key | ApiKeyCard (masked default, toggle reveal, copy) |
| 4 | Rotate API key | Rotate button + confirm dialog → BifrostPort mock |
| 5 | View weekly usage | UsageSummary card (total $, tokens, progress bar toward limit) |
| 6 | View available models | ModelList component on dashboard |
| 7 | Admin: user list | UsersTable with status, weekly $, actions |
| 8 | Admin: add user | AddUserDrawer (email, role, models, optional limit) → BifrostPort mock |
| 9 | Admin: edit user | EditUserDrawer (models, limit) → BifrostPort mock |
| 10 | Admin: remove user | ConfirmDialog → delete → BifrostPort mock |
| 11 | Admin: models config | ModelsTable (toggle active, edit pricing) |
| 12 | Admin: global limits | LimitsForm (global weekly $, per-user override list) |

## Directory layout

```
frontend/src/
  domain/           gateway.ts — User, ApiKey, Model, UsageSummary, Limits
  ports/            auth.ts, gateway.ts, admin.ts, bifrost.ts
  adapters/
    local/          local-database.ts, local-services.ts, local-scenarios.ts
  services/         app-services-provider.tsx, bootstrap/mode.ts, bootstrap/services.ts
  features/
    auth/           components/LoginForm, SetPasswordForm
    dashboard/      components/ApiKeyCard, UsageSummary, ModelList
    admin/          components/UsersTable, AddUserDrawer, EditUserDrawer, ModelsTable, LimitsForm
  app/
    routes/
      auth/login, auth/set-password
      app/dashboard (index)
      app/admin/root, admin/users, admin/models, admin/limits
    router.tsx, provider.tsx
  config/           paths.ts, env.ts
```

## Scenarios (local fixtures)

- `logged-out` — no session
- `normal-user` — active user with models and weekly usage
- `admin-user` — admin with access to admin panel
- `pending-user` — whitelisted but password not yet set (first-login redirect)
- `at-limit` — user at weekly spend limit (progress bar full)

## Mock/real boundary

Currently real:
- Routes, layout components, local validation, design system

Currently mocked:
- Auth (LocalAuthProvider using IndexedDB)
- Bifrost calls (LocalBifrostAdapter — all virtual key ops in memory)
- Usage data (fixture data in local scenarios)

Expected replacement (foundation):
- LocalAuthProvider → ApiAuthProvider (Go backend JWT auth)
- LocalBifrostAdapter → HttpBifrostAdapter (real Bifrost REST calls)
- Usage data → HttpGatewayAdapter (real usage fetch from Bifrost)
