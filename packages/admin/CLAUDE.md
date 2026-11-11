# Admin Package

Platform administration panel used by platform operators (hotels,
administrators, routes, support, subscriptions, global settings). Shared
front-end rules: `.claude/rules/front-end.md`.

## Overview

**SuiteSync admin** is the control panel of the SuiteSync team, not of any
hotel. Operators sign in with an administrator account, separate from hotel
staff, and manage the platform as a whole (`src/pages/app/`):

- **Hotels** (`hoteis`): create, edit and configure the hotels on the platform.
- **Administrators** (`administradores`): platform operator accounts.
- **Routes** (`rotas`): catalog of routes/modules that feeds the navigation
  and permissions shown to each hotel in `web`.
- **Support** (`suporte`): support access to a hotel's environment on behalf of
  one of its users.
- **Dashboard**: platform overview.

Port 5174; talks to the `api` admin endpoints (`/admin/*`).

## Platform vs Hotel Scope

Operators see every hotel, but tenant isolation stays strict:

- **Platform scope**: actions affecting the whole platform (subscriptions,
  global settings, platform metrics).
- **Hotel scope**: actions on one hotel (its users, settings, tenant data).
  Always show the active scope in the UI.
- Name hotel context explicitly in variables, query keys and props
  (`hotelId`, `selectedHotelId`, `hotelFilter`), never `id` or `current`.
