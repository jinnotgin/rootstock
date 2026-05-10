# Experience Progress

## 2026-05-10

Started effort. Collected requirements and clarified:
- Auth: email + password, whitelist-gated, first-login password setup flow
- Providers: Claude Opus 4.6, Claude Sonnet 4.6, Gemini Flash 2.5 via Bifrost
- Usage: total $ + tokens weekly (Monday 00:00 UTC reset), no per-model breakdown on user dashboard
- Admin: role flag on user account, per-user model access toggle
- API key: always retrievable, hidden by default with toggle to reveal
- Implementation strategy: vertical slices in dependency order, no approval gates between slices

Completed Slice 1: App shell.
- Seeded frontend from agent-reference (component library, utils, CSS, hooks, lib, testing)
- Created domain types (User, ApiKey, Model, UsageSummary, Limits) in src/types/api.ts
- Defined three ports: AuthProvider, GatewayProvider, AdminProvider
- Built LocalDatabase (IndexedDB + localStorage fallback) with stores: session, users, models, api-keys, usage, settings
- Built six fixture scenarios: empty, logged-out, normal-user, admin-user, pending-user, at-limit
- Built local adapters: LocalAuthProvider (with PASSWORD_NOT_SET error code for first-login redirect), LocalGatewayProvider, LocalAdminProvider
- Wired AppServices provider + bootstrap/services.ts
- Created AppLayout with sidebar nav (admin-gated items) + AppRouter with ProtectedRoute + AdminRoute guards
- Build: ✓ 0 type errors, 6 tests passing

Beginning Slice 2: Login + first-login set-password.
