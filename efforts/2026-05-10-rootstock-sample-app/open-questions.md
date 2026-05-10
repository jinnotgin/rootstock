# Open questions: Rootstock sample app

## Current questions

No current open questions.

## Answered

[experience] Should local mode default to a seeded admin session, a logged-out state, or a selectable scenario?

Decision: local mode defaults to the empty scenario and can opt into seeded scenarios with `VITE_APP_LOCAL_SCENARIO`.

[both] Should deleted discussions cascade-delete comments, or should comments remain inaccessible through discussion scoping?

Decision: deleting a discussion cascade-deletes its comments. This matches the SQLite foreign key behavior and is now covered by repository tests.

[foundation] Should SQLite run in a repo-local file by default, or use an env-configured path with a default under `backend/data/`?

Decision: SQLite uses env-configured `DATABASE_PATH` with default `data/app.db`, which resolves under `backend/data/` when running from the backend workspace.

[both] Should regular users be able to create comments on any team discussion, matching current behavior, while only admins manage discussions and users?

Decision: yes. Regular users can create comments on discussions in their team. Admin-only permissions are for user management and discussion management. This is now covered by REST handler tests.

[both] Should the API normalize all entity reads to `{ data: ... }`, including create/update/delete responses, or preserve the current mixed MSW behavior where some mutations return raw entities?

Decision: preserve the current mixed response shape for this sample. Mutations may return the changed entity directly where that matches the existing frontend/MSW contract.

[both] What should the canonical API error envelope be beyond `{ message: string }`?

Decision: keep `{ message: string }` as the canonical minimal error envelope for this sample.

[foundation] What JWT signing secret policy should local/dev use, and how should missing secrets fail?

Decision: allow the development JWT secret default only for `local` and `dev`; require explicit `JWT_SECRET` for `staging` and `production`.

[both] Should OpenAPI be handwritten first, then code generated later, or should backend annotations generate it after the first handler implementation?

Decision: keep handwritten OpenAPI as the source of truth for now. Generated frontend clients/types may consume it later.
