# ⚠️ Error Handling

### API Errors

API adapters own backend error mapping. Shared API-client interceptors can
handle cross-cutting transport behavior such as unauthorized responses, session
refresh attempts, and common response normalization, but feature code should
receive errors through port calls and React Query mutation/query state.

Use feature-level UI to decide what the user sees: inline validation messages,
empty states, retry affordances, notifications, or redirects. Do not make
components branch on raw HTTP status codes unless that mapping is intentionally
part of the adapter contract.

[API Errors Notification Example Code](../../reference/frontend/src/lib/api-client.ts)

### In App Errors

Utilize error boundaries in React to handle errors within specific parts of your application. Instead of having only one error boundary for the entire app, consider placing multiple error boundaries in different areas. This way, if an error occurs, it can be contained and managed locally without disrupting the entire application's functionality, ensuring a smoother user experience.

[Error Boundary Example Code](../../reference/frontend/src/app/routes/app/discussions/discussion.tsx)

### Error Tracking

Production monitoring is foundation work even when the code lives in the
frontend. Register monitoring through the service boundary so local mode can
use console/no-op behavior while production uses the real monitor.
