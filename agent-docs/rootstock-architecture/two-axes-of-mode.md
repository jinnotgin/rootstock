## Two axes of mode

Do not collapse all environment behavior into one variable. There are two
separate decisions:

```txt
Runtime mode      = where the app is running
Capability mode   = which implementation backs a specific port
```

Examples:

```txt
runtimeMode=dev, authCapability=api, dataCapability=local
runtimeMode=staging, authCapability=api, dataCapability=api
runtimeMode=local, authCapability=local, dataCapability=local
```

The governing rule is that mode selects adapter registration, not component
logic. Components and feature hooks should not branch on persistence type,
vendor SDK, deployment environment, or mock-vs-real state.
