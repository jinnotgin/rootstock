## Operating model

The app should support multiple levels of realness without rewriting the
experience layer:

```txt
local       -> browser-only services, fixture/local data, no real secrets
dev         -> real app code with dev services and sandboxed dependencies
staging     -> staging services and contract-equivalent integrations
production  -> production services, credentials, monitoring, and data
```

Local mode remains valuable after connected modes exist. It supports design
iteration, demos, edge-case testing, onboarding, and bug reproduction. The
experience track stops at local adapters. Once the app crosses into real auth,
real persistence, networked APIs, contract mapping, secret-bearing
integrations, or production observability, that work belongs to the foundation
track even when the code lives in the frontend.
