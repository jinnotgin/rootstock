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

## 2026-05-11

Completed Slice 2: Login + first-login set-password.
- Wired LoginForm into /auth/login route; reads ?redirectTo param and navigates on success; redirects to set-password with ?email= on PASSWORD_NOT_SET error.
- Created SetPasswordForm component (features/auth/components/set-password-form.tsx): password + confirm-password fields, uses useSetPassword hook, shows server error via alert.
- Wired SetPasswordForm into /auth/set-password route; reads ?email param, navigates to dashboard on success.
- Fixed pre-existing TypeScript error in login-form.test.tsx (Parameters<typeof makeLocalServices>[0]['scenario'] → LocalScenario import).
- Build: ✓ 0 type errors, 15 tests passing (5 test files).

Completed Slices 3–12: All dashboard and admin features.

**Slice 3 — ApiKeyCard** (`features/dashboard/components/api-key-card.tsx`): Masked key by default (30 bullets), toggle Show/Hide, Copy button (clipboard + 2s feedback), Rotate button behind ConfirmationDialog.

**Slice 4 — Rotate API key**: Wired into ApiKeyCard via ConfirmationDialog → useRotateApiKey mutation.

**Slice 5 — UsageSummaryCard** (`features/dashboard/components/usage-summary.tsx`): Weekly cost, progress bar (red at 100%), token count. Accepts `limitUsd` as prop (passed from user record in dashboard route).

**Slice 6 — ModelList** (`features/dashboard/components/model-list.tsx`): Lists models available to the user with provider badge.

**Slice 7 — UsersTable** (`features/admin/components/users-table.tsx`): Table of all users with role/status badges, limit column, Edit and Delete actions.

**Slice 8 — AddUserDrawer**: Email, role select, custom limit field. Creates user via LocalAdminProvider.

**Slice 9 — EditUserDrawer**: Model access checkboxes, custom limit field. Updates user via LocalAdminProvider.

**Slice 10 — Delete user**: ConfirmationDialog in UsersTable → deleteUser mutation → table refreshes.

**Slice 11 — ModelsTable** (`features/admin/components/models-table.tsx`): All models with active badge, pricing columns, Edit button per row. EditModelDrawer: active toggle (Switch), input/output price fields.

**Slice 12 — LimitsForm** (`features/admin/components/limits-form.tsx`): Global weekly limit input, saves via updateGlobalLimits, shows success message.

**Supporting lib hooks**: `lib/gateway.ts` (useApiKey, useRotateApiKey, useUsage, useModels), `lib/admin.ts` (all admin mutations and queries).

**Bug fix**: `local-scenarios.ts` hardcoded `WEEK_START = '2026-05-05'`; changed to `currentWeekStart()` so fixture usage data always matches the current week.

**All routes wired**: dashboard, admin/users, admin/models, admin/limits.

Build: ✓ 0 type errors · ✓ 35/35 tests passing (11 test files).

**All 12 slices complete. Experience implementation done.**
