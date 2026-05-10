# Rootstock architecture alignment

This project uses an experience-first, foundation-backed AI-DLC model.
Experience work produces running product experience: screens, flows, states,
copy, fixtures, interaction behavior, and local adapters. Foundation work
produces the trust boundary around that experience: real authentication,
authorization, persistence, API contracts, frontend API adapters, integration
adapters, monitoring, backend services, and operational rules.

Both tracks work in the codebase. The separation is by concern, not by job
title or team boundary.

This document has been split into smaller files:

- [Operating model](operating-model.md)
- [Two axes of mode](two-axes-of-mode.md)
- [Frontend structure](frontend-structure.md)
- [Local adapters and MSW](local-adapters-and-msw.md)
- [Contract boundary](contract-boundary.md)
- [Shared vocabulary](shared-vocabulary.md)
- [Go backend mapping](go-backend-mapping.md)
- [Secrets and browser code](secrets-and-browser-code.md)
- [Testing guidance](testing-guidance.md)
