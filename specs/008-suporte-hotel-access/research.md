# Research: Suporte — Admin Access to Hotel Web App

**Feature**: 008-suporte-hotel-access
**Date**: 2026-07-01 (revised same day — see #1)

---

## 1. Cross-app access mechanism — revised: server-side redirect, no web-app form

**Decision**: The admin app's "Access" button opens a plain browser navigation (`window.open`, not a `fetch`/XHR) directly to an admin-authenticated API endpoint: `GET /admin/hoteis/:id/suporte-acesso?usuario_id=...`. That endpoint validates everything, sets the web app's normal `token` cookie itself, and responds with an HTTP 302 redirect straight to `WEB_APP_URL`. On error, it responds with a minimal self-contained HTML error page rendered by the API itself — never JSON, since nothing is there to parse it.

**Rationale**: Explicit product constraint — no form/page is to be built in `packages/web` to grant access. A plain top-level browser navigation to the API is not a `fetch` call, so it isn't subject to CORS at all, and the `admin_token` cookie is attached automatically (same domain-only cookie scoping already relied on elsewhere in this dev setup). This means the entire "opaque exchange token" concept from the original design is unnecessary — there's no second hop to redeem a token on, so there's nothing to redeem.

**Alternatives considered** (superseded, kept for history):
- ~~One-time opaque exchange token + a public `POST /suporte/entrar` JSON endpoint redeemed by a dedicated `packages/web` entry page~~ — rejected per explicit instruction: this required building a page/form in the web app purely to submit the token, which is exactly what was ruled out.
- Rely on the incidental cross-port cookie sharing alone, with no server-driven redirect at all (i.e. just tell the admin to open `localhost:5173` manually) — rejected: doesn't select a specific user to impersonate, doesn't produce a clean one-click experience, and still wouldn't work outside dev's shared-`localhost` accident.

## 2. Making the web app actually *look* logged in after the redirect

**Decision**: `packages/web`'s `AuthContext` currently hydrates its session **only** from `localStorage` on mount — it never asks the server. Landing on `/` with a valid `token` cookie but empty `localStorage` would still bounce to `/login`. Fix: when `AuthContext` mounts with no cached session, it silently calls `GET /auth/me`; if that succeeds (valid cookie), it populates the session (including the `suporte` flag if present) before rendering; if it 401s, it proceeds to `/login` as today. This is **not** a form or a page — it's an automatic background check that already piggybacks on an endpoint (`/auth/me`) the app calls elsewhere (`useRotasSync`).

**Rationale**: This is the minimum change required for the redirect-based flow (#1) to actually work, and it's a strict subset of logic the app already has (the shape of `/auth/me`'s response is unchanged from the original design). No visible UI, no user input, no new route.

**Alternatives considered**:
- Encode the full session into the redirect URL (e.g. query params) for the web app to read on mount — rejected: exposes session data in the URL/browser history/server logs, and still requires *some* client code to consume it, but with weaker security than a cookie.
- Skip the bootstrap fix and accept that Suporte access "doesn't really work" from the web app's point of view — rejected: it would fail the spec's own acceptance criteria (US2, scenario 2) that the hotel's web app opens "already authenticated."

## 3. Support session identity & lifetime

**Decision**: Unchanged from the original research — reuse the existing web-app JWT/cookie mechanism (`token` cookie, `app.authenticate`, `PayloadJWTSchema`), adding an optional `suporte: { administratorId, administratorNome }` claim and a short `expiresIn` (30 minutes) instead of the normal 7 days. This is now set directly by the redirect endpoint itself (there is no second endpoint to set it).

**Rationale**: See original rationale — reuses all existing hotel-scoped protections; no parallel auth system.

## 4. Impersonated identity model

**Decision**: Unchanged — the admin explicitly picks which existing hotel user to act as (spec FR-005, resolved via Clarifications), sourced from the existing `IUserRepository.list(hotelId, pagination)`. This selection happens in the admin app's own dialog (not the web app), so it isn't affected by the "no web-app forms" constraint.

## 5. Hotel active/inactive status

**Decision**: Unchanged — add `status String @default("S") @db.Char(1)` to `Hotel`, mirroring `Grupo.status`/`Administrator.status`. See original rationale (FR-002/FR-003 are meaningless without it).

## 6. Minimal hotel status toggle in the admin UI

**Decision**: Unchanged — add a status `Select` to the existing hotel edit form in `packages/admin`, mirroring the Grupo edit form. This is in the admin app, not the web app, so it's unaffected by the new constraint.

## 7. Audit trail — log-based, not a database table

**Decision**: There is no `SuporteAcesso` table at all. Every granted access is recorded as a structured log line (via Fastify's built-in logger, `request.log.info({ administrator_id, hotel_id, usuario_id, event: 'suporte_acesso' }, ...)`), emitted only after all validation passes. `Hotel.status` remains the **only** new database field this feature introduces.

**Rationale**: Explicit product constraint — no new database fields/tables beyond `Hotel.status`. FR-007 ("record an auditable entry") and SC-002 ("retrievable audit record") don't specify *how* the record must be stored, and a structured log line satisfies both: it's produced for every grant and it's retrievable (via the server's log output/log aggregation), without adding persistence, a migration, an entity, or a repository for something that has no other reader in this feature.

**Alternatives considered** (superseded, kept for history):
- ~~`SuporteAcesso` Prisma model as a pure audit log~~ — rejected per explicit instruction: no DB fields beyond `Hotel.status`.
- ~~`SuporteAcesso` with token/expiry/used-state columns (original design)~~ — already superseded once by #1; doubly moot now.

## 8. Route/module placement — simplified further

**Decision**: The single endpoint, `GET /admin/hoteis/:id/suporte-acesso` (admin-authenticated), still lives in its own `suporte` route/use-case module (`routes/suporte/admin/suporte_routes.ts`, `core/usecases/suporte/criar_suporte_acesso_use_case.ts`) since the validation logic (hotel active? user belongs to hotel?) is real business logic worth isolating and unit-testing on its own. There is no `core/repositories/suporte/` and no `core/entities/suporte_acesso.ts` anymore — the use case depends only on the existing `IHotelRepository`, `IUserRepository`, and `IRouteRepository`, with no persistence of its own.

**Rationale**: Matches the existing Clean Architecture convention (a use case per bounded intent) without inventing a repository/entity pair that would have nothing to read or write.

## 9. New environment variable

**Decision**: Unchanged — `WEB_APP_URL` in `packages/api/src/config/env.ts` (default `http://localhost:5173`), now used as the redirect target (`reply.redirect(WEB_APP_URL)`) instead of building a token-bearing URL.
