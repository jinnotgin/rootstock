# 💻 Application Overview

The current sample is a Rootstock version of a simple team discussion app.
Users can create teams where other users can join, and they start discussions
on different topics between each other.

A team is created during the registration if the user didn't choose to join an existing team and the user becomes the admin of it.

The app is intentionally structured so the same user experience can run in
local mode or API-backed modes. Runtime and capability modes select local or
API adapters behind stable frontend ports; screens and feature hooks should not
know which implementation is active.

## Data model

The application contains the following models:

- User - can have one of these roles:

  - `ADMIN` can:
    - create/edit/delete discussions
    - create/delete all comments
    - delete users
    - edit own profile
  - `USER` - can:
    - edit own profile
    - create/delete own comments

- Team: represents a team that has 1 admin and many users that can participate in discussions between each other.

- Discussion: represents discussions created by team members.

- Comment: represents all the messages in a discussion.

## Get Started

To inspect the completed sample implementation, check the README files under
`agent-reference/frontend/` and `agent-reference/backend/`. The root `frontend/` and
`backend/` directories are intentionally empty starting points. For Rootstock
architecture details, start with
[`../rootstock-architecture/index.md`](../rootstock-architecture/index.md).
