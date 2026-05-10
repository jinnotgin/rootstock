# Scope: Rootstock sample app

## Summary

Convert the reference Bulletproof React sample into a Rootstock sample app with aligned frontend and Go backend architecture:

- Keep the current sample domain: auth, teams, users, discussions, comments.
- Add frontend ports/adapters with a composition root so local/mock and true-backend modes use the same UI code.
- Build the missing Go backend using clean architecture, SQLite persistence, and swappable repository adapters.
- Use OpenAPI as the frontend/backend contract source of truth.
- Document how frontend ports/adapters map to Go clean architecture concepts, including the distinction between ports, adapters, and constructors.

## Public interfaces

Frontend service boundary:

```ts
type RuntimeMode = 'local' | 'dev' | 'staging' | 'production';

interface AppServices {
  auth: AuthProvider;
  teams: TeamStore;
  users: UserStore;
  discussions: DiscussionStore;
  comments: CommentStore;
  flags: FlagProvider;
  monitor: Monitor;
}
```

Backend API boundary:

```txt
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /teams

GET    /users
PATCH  /users/profile
DELETE /users/{userId}

GET    /discussions
POST   /discussions
GET    /discussions/{discussionId}
PATCH  /discussions/{discussionId}
DELETE /discussions/{discussionId}

GET    /comments?discussionId={discussionId}
POST   /comments
DELETE /comments/{commentId}

GET    /healthcheck
```

## Assumptions

- The prior sample implementation is retained under `reference/frontend/` and `reference/backend/`.
- The root `frontend/` and `backend/` folders are intentionally empty starting points for future implementation work.
- SQLite is the first true backend store, but persistence must remain adapter-swappable.
- OpenAPI is the contract source of truth.
- IndexedDB is the preferred local persistence mechanism.
- MSW remains useful, but ports/adapters become the primary mock/real boundary.
- Effort documentation always lives in subfolders under `efforts/`.
