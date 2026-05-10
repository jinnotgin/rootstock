# Open questions: AI-DLC sample app

## Current questions

[both] Should the API normalize all entity reads to `{ data: ... }`, including create/update/delete responses, or preserve the current mixed MSW behavior where some mutations return raw entities?

[both] What should the canonical API error envelope be beyond `{ message: string }`?

[foundation] Should SQLite run in a repo-local file by default, or use an env-configured path with a default under `backend/data/`?

[foundation] What JWT signing secret policy should local/dev use, and how should missing secrets fail?

[experience] Should local mode default to a seeded admin session, a logged-out state, or a selectable scenario?

[both] Should deleted discussions cascade-delete comments, or should comments remain inaccessible through discussion scoping?

[both] Should regular users be able to create comments on any team discussion, matching current behavior, while only admins manage discussions and users?

[both] Should OpenAPI be handwritten first, then code generated later, or should backend annotations generate it after the first handler implementation?

