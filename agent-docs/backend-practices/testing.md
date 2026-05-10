# 7. Testing

- **Unit tests**: Mock interfaces defined in use cases. Test business logic in isolation.
- **Integration tests**: Run in separate container via `make compose-up-integration-test`. Test full request flows against real DB/MQ.
