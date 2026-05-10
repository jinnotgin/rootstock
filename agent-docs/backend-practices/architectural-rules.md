# 4. Architectural Rules — Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Define interfaces in the **consumer** package (use case) | Define interfaces in the **provider** package (repo) |
| Keep use cases free of HTTP/gRPC/DB concerns | Import `fiber`, `pgx`, or `grpc` in use case code |
| Pass `internal/entity` types across boundaries | Pass DB row structs or protobuf types into use cases |
| Use constructor injection for all dependencies | Use global variables or service locators |
| One struct per file in `usecase/` | Monolithic use case files spanning multiple domains |
| Let controllers handle serialization / error mapping | Return HTTP status codes from use cases |
| Communicate between outer-layer components through use cases | Call a repository directly from a controller |
| Add layers only when genuinely needed | Add abstraction for abstraction's sake |
