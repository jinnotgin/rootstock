# AI-DLC sample backend

This backend implements the true-backend mode for the sample app. It follows the clean architecture guidance in `agent-docs/backend-practices.md` and aligns with the frontend AI-DLC ports/adapters model.

## Run

```sh
go run ./cmd/app
```

Defaults:

- `ADDRESS=:8080`
- `DATABASE_PATH=data/app.db`
- `JWT_SECRET=dev-secret-change-me`
- `COOKIE_NAME=bulletproof_react_app_token`

The API is mounted under `/api` and the OpenAPI contract lives at `docs/openapi/openapi.yaml`.

## Architecture mapping

```txt
Go port        = interface defined by the use case
Go adapter     = concrete repo/controller implementation
Go constructor = New... function that injects dependencies
```

Constructors wire ports and adapters together. They are not themselves ports or adapters.

