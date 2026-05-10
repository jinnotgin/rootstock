# 2. Project Structure

```
cmd/app/main.go          → Entrypoint. Config + logger init, then delegates to internal/app.
config/                   → Env-based config (12-factor). See .env.example.
docs/                     → Auto-generated Swagger + protobuf definitions. Do not edit manually.
integration-test/         → Containerized integration tests.
internal/
  app/                    → App bootstrap (Run function), DI wiring, graceful shutdown.
    app.go                → Main wiring. Split into multiple files if it grows.
    migrate.go            → DB migrations (build tag: `migrate`).
  controller/             → Inbound adapters (entry points).
    restapi/              → Fiber HTTP handlers + Swagger annotations.
    grpc/                 → gRPC service implementations.
    amqp_rpc/             → RabbitMQ RPC handlers.
    nats_rpc/             → NATS RPC handlers.
  entity/                 → Domain models. Used across all layers. May contain validation methods.
  usecase/                → Business logic. One file = one struct = one domain area.
  repo/
    persistent/           → Database repositories (Postgres via Squirrel).
    webapi/               → External API clients (e.g. translation service).
pkg/                      → Shared library code (rabbitmq, nats, etc.).
```
