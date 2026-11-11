# Web Package

Hotel operations app used by hotel staff (reservations, rooms, rate plans,
quotes, guests, check-in/out). Shared front-end rules:
`.claude/rules/front-end.md`.

## Dynamic Sidebar

`components/layout/sidebar.tsx` renders navigation from `session.rotas` (saved
at login):

- Grouped by `modulo`, sorted by `ordem`.
- Icons resolved through `ICON_MAP` using each route's `icone`.
- Never hardcode navigation items.
