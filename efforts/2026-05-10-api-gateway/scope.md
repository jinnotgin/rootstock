# Scope: API Gateway Control Plane

## What this is

A control plane UI on top of Bifrost (virtual key manager). Users log in to view their API key and usage. Admins manage the whitelist, per-user model access, and spend limits.

## In scope

- User authentication (email + password, whitelist-gated, first-login password setup)
- User dashboard: API key (hidden by default, toggle to reveal, copy, rotate), available models, weekly usage (total $ + tokens)
- Admin panel: user list, add/edit/remove users, model config, global and per-user limits
- All Bifrost calls (create key, rotate key, delete key, update limits, fetch usage) — mocked locally, real in foundation

## Out of scope

- The actual API proxy/gateway logic — Bifrost handles that
- Email delivery (invite emails, password reset emails) — foundation concern
- Billing/invoicing beyond display
- Multi-tenancy

## Shared interfaces (experience ↔ foundation)

```
AuthProvider.login(email, password) → { user, token }
AuthProvider.setPassword(email, token, password) → void
AuthProvider.getCurrentUser() → User | null
GatewayProvider.getApiKey(userId) → ApiKey
GatewayProvider.rotateApiKey(userId) → ApiKey
GatewayProvider.getUsage(userId, week) → UsageSummary
GatewayProvider.listModels(userId) → Model[]
AdminProvider.listUsers() → User[]
AdminProvider.createUser(input) → User
AdminProvider.updateUser(userId, input) → User
AdminProvider.deleteUser(userId) → void
AdminProvider.listAllModels() → Model[]
AdminProvider.updateModel(modelId, input) → Model
AdminProvider.getGlobalLimits() → Limits
AdminProvider.updateGlobalLimits(input) → Limits
```

## Assumptions

- Weekly usage resets Monday 00:00 UTC
- API key is always retrievable (no one-time reveal)
- Admin role is a flag on the user record — same login flow
- First login: user is whitelisted with no password; on first login attempt, redirected to set-password screen
- Bifrost is not live yet; all calls go through a mocked local adapter until foundation replaces it

## Constraints

- Experience persona: no real auth, no real persistence, no real Bifrost calls
- All product behavior must be testable via local adapters and port-level tests
