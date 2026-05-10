# 🧪 Testing

For Rootstock boundaries, test the behavior at the layer that owns it: ports and
providers for frontend service contracts, local adapters for browser-only mode,
API adapters for HTTP wire-shape mapping, and E2E flows for user-visible
integration. MSW remains useful for request interception and executable
scenarios, but it should not be the only definition of product behavior. See
[`../rootstock-architecture/index.md`](../rootstock-architecture/index.md).

Use TDD for frontend behavior changes:

```txt
Red      -> write or update a failing test for the visible behavior, port contract, or adapter behavior
Green    -> make the smallest change that passes that test
Refactor -> clean up while keeping the same tests green
```

The point of frontend tests in Rootstock is not only quality. Tests prevent the
local product experience and the real foundation implementation from silently
diverging.

## Types of tests:

### Port And Provider Tests

Port/provider tests prove that `makeServices(config)` selects the expected
adapter registrations for runtime and capability modes. They also prove feature
hooks can consume services without knowing whether the backing implementation
is local or API-backed.

### Local Adapter Tests

Local adapter tests verify browser-only product behavior: local persistence,
scenario seed data, authorization-sensitive writes, empty states, expired
sessions, and permission-denied flows. These are experience-layer tests, but
they still need realistic domain behavior.

[Unit Test Example Code](../../agent-reference/frontend/src/components/ui/dialog/confirmation-dialog/__tests__/confirmation-dialog.test.tsx)

### API Adapter Tests

API adapter tests verify HTTP wire-shape mapping, response normalization,
session behavior, and backend error handling. They should prove that API-backed
adapters satisfy the same port contracts as local adapters.

### Integration Tests

Integration testing checks how screens, feature hooks, providers, and adapters
work together. Focus these tests on user-visible states and documented
scenarios: empty, loading, success, validation failure, save failure,
permission denied, and role-specific behavior.

[Integration Test Example Code](../../agent-reference/frontend/src/app/routes/app/discussions/__tests__/discussion.test.tsx)

### Contract Tests

Contract tests verify that real adapters conform to frontend ports and that API
responses match the OpenAPI contract. These tests are the main guard against
mock drift.

### E2E

End-to-end tests run the complete app through critical user paths. Run them
across meaningful mode combinations where possible: local capability mode for
experience scenarios and API capability mode for backend integration.

[E2E Example Code](../../agent-reference/frontend/e2e/tests/smoke.spec.ts)

## Recommended Tooling:

#### [Vitest](https://vitest.dev)

Vitest is a powerful testing framework with features similar to Jest, but it's more up-to-date and works well with modern tools. It's highly customizable and flexible, making it a popular option for testing JavaScript code.

#### [Testing Library](https://testing-library.com/)

Testing library is a set of libraries and tools that makes testing easier than ever before. Its philosophy is to test your app in a way it is being used by a real world user instead of testing implementation details. For example, don't test what is the current state value in a component, but test what that component renders on the screen for its user. If you refactor your app to use a different state management solution for example, the tests should still be relevant as the actual component output to the user shouldn't change.

#### [Playwright](https://playwright.dev)

Playwright is a tool for running e2e tests in an automated way.
You define all the commands a real world user would execute when using the app and then start the test. It can be started in 2 modes:

- Browser mode - it will open a dedicated browser and run your application from start to finish. You get a nice set of tools to visualize and inspect your application on each step. Since this is a more expensive option, you want to run it only locally when developing the application.
- Headless mode - it will start a headless browser and run your application. Very useful for integrating with CI/CD to run it on every deploy.

#### [MSW](https://mswjs.io)

MSW is useful for request interception, executable scenario fixtures, API
contract simulation, and tests that need network-shaped behavior. It is not the
primary Rootstock architecture boundary.

Product behavior in local mode should live behind local adapters that satisfy
the same ports as API adapters. MSW handlers can support tests, stories, and
contract simulation, but do not rely on an MSW handler as the only definition
of product behavior.

[API Handlers Example Code](../../agent-reference/frontend/src/testing/mocks/handlers/auth.ts)

[Data Models Example Code](../../agent-reference/frontend/src/testing/mocks/db.ts)
