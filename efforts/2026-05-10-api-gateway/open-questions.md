# Open Questions

## Mock/real boundary

Currently real:
- Front-end routes, design system components, local validation

Currently mocked:
- Auth (LocalAuthProvider), Bifrost calls (LocalBifrostAdapter), usage data (fixtures)

Expected replacement:
- LocalAuthProvider → ApiAuthProvider (Go backend)
- LocalBifrostAdapter → HttpBifrostAdapter (real Bifrost)

---

## Unresolved

[foundation]  What is the exact Bifrost API contract for virtual key creation? (endpoint, auth headers, request/response shape)

[foundation]  How does Bifrost represent per-model spend limits vs global spend limits?

[foundation]  What is the Bifrost usage response shape? (per-model breakdown, weekly granularity)

[foundation]  What token do we use to authenticate our backend calls to Bifrost?

[experience]  Should the admin user list show a "last active" column, or just "member since"?

[experience]  When a user is at their limit, should the progress bar turn red at 100% or warn at 80%?

[both]        What happens when session expires mid-flow — silent redirect to login, or a toast?
