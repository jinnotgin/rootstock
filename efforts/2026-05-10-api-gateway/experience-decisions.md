# Experience Decisions

## 2026-05-10

### Bifrost as a port, not inline HTTP

Decided: All Bifrost operations go through a `BifrostProvider` port interface, with a `LocalBifrostAdapter` for experience and a future `HttpBifrostAdapter` for foundation.

Why: Bifrost is not live yet. Wiring it inline would block all experience work. The port lets us build and test the full UI without any backend dependency.

Rejected: Putting Bifrost calls directly in feature hooks — this would make the adapter boundary untestable and leak infrastructure into feature code.

### First-login as a separate route, not a modal

Decided: `/auth/set-password` is a distinct route, not a modal on the login page.

Why: The user may land on login directly from a shared link or bookmark. The set-password flow has distinct validation and copy; keeping it separate avoids hiding state in the login form.

### Weekly usage display: total only, no per-model breakdown

Decided: User dashboard shows one total $ + total tokens for the week.

Why: User confirmed this is sufficient. Per-model breakdown adds complexity with no immediate user need. Can be added in a later slice if requested.

### Admin role: flag on user, not separate login

Decided: Admin users log in through the same `/auth/login` route and see an additional Admin nav item.

Why: Simpler UX. No separate credential set to manage. Admins are just users with elevated permissions.
