# Admin Package

Platform administration panel used by platform operators (hotels,
administrators, routes, support, subscriptions, global settings). Shared
front-end rules: `.claude/rules/front-end.md`.

## Platform vs Hotel Scope

Operators see every hotel, but tenant isolation stays strict:

- **Platform scope**: actions affecting the whole platform (subscriptions,
  global settings, platform metrics).
- **Hotel scope**: actions on one hotel (its users, settings, tenant data).
  Always show the active scope in the UI.
- Name hotel context explicitly in variables, query keys and props
  (`hotelId`, `selectedHotelId`, `hotelFilter`), never `id` or `current`.
