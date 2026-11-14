# Web Package

Hotel operations app used by hotel staff (reservations, rooms, rate plans,
quotes, guests, check-in/out). Shared front-end rules:
`.claude/rules/front-end.md`.

## Overview

**SuiteSync web** is the day-to-day workspace of a single hotel. Staff sign in
to their own hotel and see only its data. Main areas (`src/pages/app/`):

- **Reservations**: list, new reservation, availability calendar, guest
  editing and the FNRH (guest registration) form with a shareable public link.
- **Quotes** (`reservas/orcamentos`): create, edit and share quotes, with a
  public quote page for the customer.
- **Rooms and categories**: `quartos`, `categorias_quartos`, meal plans
  (`regimes_alimentacao`).
- **Rate plans** (`tarifarios`): rate calendar and pricing per category.
- **Commercial**: partners (`comercial/parceiros`) and their commercial rules.
- **Access control**: users (`usuarios`) and groups (`grupos`).
- **Hotel settings** (`configuracoes/hotel`): registration data, operating
  hours, house rules and visual identity (theme).
- **Dashboard**: overview of operations.

Public pages without login: `/orcamento/:token` and `/fnrh/:token`.
Port 5173; talks to `api` (`VITE_API_URL`, default `http://localhost:3000`).

## Dynamic Sidebar

There is no top navbar: the app shell is `AppShell` from `@hotelmind/ui`
(sidebar on desktop, drawer plus a minimal bar on mobile). `components/layout/
sidebar.tsx` wraps it with session data and renders navigation from
`session.rotas` (saved at login) through `components/layout/build_navigation.ts`:

- Grouped by `modulo`, sorted by `ordem`. A module with a single resource is a
  flat item labelled by the resource; otherwise it is a collapsible group.
- Icons resolved through `ICON_MAP` using each route's `icone` (unknown icons
  fall back to `LayoutDashboard`).
- The footer holds the notifications bell and `SidebarUserCard` (user name,
  hotel name, theme toggle and logout in a menu).
- The collapsed state persists in `localStorage` under
  `suitesync-sidebar-collapsed`.
- Never hardcode navigation items.
