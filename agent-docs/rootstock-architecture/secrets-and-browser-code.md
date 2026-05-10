## Secrets and browser code

Frontend build tools expose selected environment variables to browser bundles.
Vite exposes configured prefixes, and similar frameworks inline public
variables into JavaScript. Browser code may use public identifiers and
publishable keys, but never secrets.

Secret-bearing integrations belong behind a backend or BFF endpoint. This is
one reason feature code should depend on ports instead of importing vendor SDKs
directly.
