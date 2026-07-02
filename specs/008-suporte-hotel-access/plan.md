# Implementation Plan: Suporte — Admin Access to Hotel Web App

**Branch**: `008-suporte-hotel-access` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-suporte-hotel-access/spec.md`

## Summary

Add a "Suporte" module to the admin app that lists active hotels and lets an admin pick an existing user of a chosen hotel to impersonate, then opens the hotel-facing web app in a new tab, already authenticated, via a single one-click server-side redirect — **no page, route, or form is added to `packages/web` to grant this access**, and **`Hotel.status` is the only new database field this feature introduces** (no audit table). This requires: (1) a new `status` field on `Hotel` (it has none today, so "active hotels" is currently meaningless), (2) one new admin-authenticated endpoint that validates, logs the access event, sets a short-lived `suporte`-flagged session cookie, and 302-redirects to the web app, and (3) a passive, formless session-bootstrap fix in `packages/web`'s `AuthContext` so it recognizes that cookie on arrival (it currently only reads `localStorage`).

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+), matching the rest of the monorepo

**Primary Dependencies**: Fastify, `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, Prisma, Zod (`packages/api`); React 19, Vite, TanStack Query, React Router, Axios, React Hook Form + Zod, Radix/shadcn UI, Sonner (`packages/admin`, `packages/web`)

**Storage**: PostgreSQL via Prisma — exactly one new column (`Hotel.status`). No new table: the access audit trail is a structured log line, not a persisted row.

**Testing**: Vitest, TDD mandatory per package `CLAUDE.md` — `.spec.ts`/`.spec.tsx` written before implementation; Fastify `inject` for routes; in-memory repository fakes; React Testing Library + MSW for frontend

**Target Platform**: Linux server (API) + browser SPAs (admin, web); pnpm workspace monorepo

**Project Type**: Web application spanning three packages — `packages/api` (one new endpoint, schema, log-based audit), `packages/admin` (new menu/page/picker), `packages/web` (passive session-bootstrap fix + optional support banner — no new route/page/form)

**Performance Goals**: Standard interactive web latency; not scale-sensitive (SC-001 targets <10s end-to-end for the whole access flow, dominated by human interaction, not throughput)

**Constraints**:
- **No form, page, or route may be added to `packages/web` to grant Suporte access** (explicit product decision). The access mechanism must be a single admin-authenticated GET the admin app opens as a plain browser navigation, ending in a server-side redirect.
- **No new database fields/tables beyond `Hotel.status`** (explicit product decision) — every grant is recorded as a structured log line via Fastify's built-in logger, not a persisted row.
- Support session must be short-lived and clearly distinguished from a normal 7-day hotel-user login (spec FR-006, FR-010).
- Must preserve existing multi-tenant `hotel_id` scoping and Clean Architecture layering (thin routes, use cases own orchestration, repositories abstract Prisma) per both `packages/api/CLAUDE.md` and the root constitution.

**Scale/Scope**: One new database column (`Hotel.status`) — no new table; one new API endpoint (plus two existing endpoints extended — `GET /admin/hoteis` status filter, `GET /auth/me` suporte field); one new admin page + dialog; one small bootstrap fix in `packages/web`'s `AuthContext` + one optional banner component (no new route); a minimal status toggle added to the existing hotel edit form (see research.md #5 for why this is in-scope).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies | Status |
|---|---|---|
| I. Contract-First Development | Yes | ✅ Pass — the only genuinely cross-package shape introduced (`suporte` field on the login/me response) is added to the existing `packages/.contracts/src/auth.ts`, not duplicated per-package. `Hotel`'s new `status` field and the admin-only user-picker payload stay local to `packages/admin`, consistent with `Hotel` never having been a shared contract (only `AuthHotel`, a narrower subset, is shared today). |
| II. Clean Architecture & Strict Layer Boundaries | Yes | ✅ Pass — the new `CriarSuporteAcessoUseCase` follows the established `core/usecases/<domain>` → `routes/<domain>` layering, depending only on existing repository interfaces (`IHotelRepository`, `IUserRepository`, `IRouteRepository`); routes stay thin and instantiate their own dependencies per the composition-root pattern already used everywhere else. |
| III. SOLID Principles | Yes | ✅ Pass — the use case depends on repository interfaces, not Prisma directly (Dependency Inversion); no new repository was invented for something with nothing to persist (avoids a needless Interface Segregation violation of its own — an interface with no real operations). |
| IV. Explicit over Implicit | Yes | ✅ Pass — the redirect endpoint validates and logs the access event explicitly, in one traceable request; the `suporte` JWT claim makes the elevated-access state explicit and inspectable, not inferred. `packages/web`'s new bootstrap check is an explicit, deliberate call to `/auth/me`, not a hidden side effect. |
| V. Low Coupling, High Cohesion | Yes | ✅ Pass — `packages/admin` and `packages/web` never call each other directly; the browser navigation goes admin → api → web, all coordination goes through `packages/api`. The new use case doesn't reach into `hotels`/`groups`/`users` internals — it depends only on their existing repository interfaces. |
| VI. Clean Code | Yes | ✅ Pass — new files follow `snake_case` (`criar_suporte_acesso_use_case.ts`, `suporte_routes.ts`); no speculative persistence layer built for data with no reader (a repository/entity pair was deliberately *not* added — see research.md #7/#8). |
| VII. Testability by Design | Yes | ✅ Pass — `CriarSuporteAcessoUseCase` accepts repository interfaces so it's testable with in-memory fakes; the redirect route is testable via Fastify `inject` (asserting the 302 `location` header, `Set-Cookie`, and the emitted log line), with no clock/expiry logic to fake. |

**Post-Phase 1 re-check**: All principles still pass after data-model/contracts design below — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/008-suporte-hotel-access/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions and rationale
├── data-model.md        # Phase 1 output — Prisma changes, entities, repositories, use cases
├── quickstart.md        # Phase 1 output — end-to-end validation guide
├── contracts/
│   └── api.md            # Phase 1 output — endpoint contracts
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
packages/api/src/
├── prisma/
│   └── schema.prisma                                  # + Hotel.status only — no new table
├── core/
│   └── usecases/
│       └── suporte/
│           └── criar_suporte_acesso_use_case.ts        # new — validates hotel/user, returns session data (no persistence)
├── routes/
│   ├── hotels/admin/hotels_routes.ts                   # + GET /admin/hoteis/:id/usuarios; querystring status filter on GET /admin/hoteis
│   └── suporte/
│       └── admin/suporte_routes.ts                     # new — GET /admin/hoteis/:id/suporte-acesso (redirect + request.log.info audit line)
├── schemas/
│   ├── hotels/admin/hotels_schema.ts                   # + status field, + usuarios list schema
│   └── suporte/
│       └── admin/suporte_schema.ts                     # new
├── plugins/auth_plugin.ts                               # PayloadJWTSchema + optional `suporte` claim
└── config/env.ts                                        # + WEB_APP_URL (redirect target)

packages/.contracts/src/
└── auth.ts                                              # + SuporteSession, LoginResponse.suporte?, MeResponse.suporte?

packages/admin/src/
├── components/layout/Sidebar.tsx                        # + "Suporte" nav item
├── api/
│   ├── hoteis.service.ts                                # + status field, + status filter param
│   └── suporte.service.ts                               # new — listarUsuarios(hotelId); builds the GET access URL (no fetch needed)
├── pages/app/
│   ├── hoteis/editar.tsx                                # + status Select (mirrors Grupo edit)
│   └── suporte/
│       └── index.tsx                                    # new — hotel list + user-picker dialog + "Acessar" button (window.open)
└── mocks/handlers/suporte_handlers.ts                    # new

packages/web/src/
├── contexts/AuthContext.tsx                              # + passive bootstrap: calls GET /auth/me on mount when no cached session exists; session gains optional `suporte`
└── components/layout/SupportBanner.tsx                   # new — non-interactive indicator + "Encerrar" button, shown when session.suporte is present
```

**No changes to `packages/web/src/routes.tsx`** and no new page/form anywhere in `packages/web` — the redirect lands on the existing `/` route, and the `AuthContext` bootstrap fix is what makes it render as already logged in.

**Structure Decision**: Follows the existing three-package layout (`api`, `admin`, `web`) with a new `suporte` bounded context inside the API's Clean Architecture layers, plus the minimal additions each frontend needs. No new packages are created.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
