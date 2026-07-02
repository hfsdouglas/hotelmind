---

description: "Task list for Suporte — Admin Access to Hotel Web App"
---

# Tasks: Suporte — Admin Access to Hotel Web App

**Input**: Design documents from `/specs/008-suporte-hotel-access/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Included and mandatory — both `packages/api/CLAUDE.md` and `packages/admin/CLAUDE.md`/`packages/web/CLAUDE.md` require TDD ("no implementation without a prior failing test"), so every implementation task below has a corresponding test task that must be written and failing first.

**Organization**: Tasks are grouped by user story (US1, US2) per spec.md, both priority P1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 or US2 — omitted for Setup/Foundational/Polish tasks
- File paths are exact and relative to the repo root

---

## Phase 1: Setup

- [X] T001 Add `WEB_APP_URL` (default `http://localhost:5173`) to the env schema in `packages/api/src/config/env.ts`, and add the corresponding entry to `packages/api/.env` and `packages/api/.env.example`

---

## Phase 2: Foundational — `Hotel.status` (blocks both user stories)

**Purpose**: `Hotel` currently has no active/inactive concept. Both US1 ("list active hotels") and US2 ("hotel must be active to grant access") are meaningless without this. This is the only new database field in the whole feature (per explicit product constraint — no `SuporteAcesso` table).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests (write first, confirm failing)

- [X] T002 [P] Add `status` cases to `packages/api/src/core/entities/hotel.spec.ts` (defaults to `'S'`; accepts explicit `'N'`)
- [X] T003 [P] Add `status` cases to `packages/api/src/routes/hotels/admin/hotels_routes.spec.ts`: create/update a hotel with `status`, and `GET /admin/hoteis?status=S`/`status=N` filtering

### Implementation

- [X] T004 Add `status String @default("S") @db.Char(1)` to the `Hotel` model in `packages/api/src/prisma/schema.prisma`; run `pnpm --filter api prisma migrate dev --name add_hotel_status`
- [X] T005 [P] Add `status: string` to `packages/api/src/core/entities/hotel.ts` (`HotelProps` + constructor, default `'S'`) — satisfies T002
- [X] T006 Add optional `status?: string` to `CreateHotelData`/`UpdateHotelData` and an optional `status` filter to the list params in `packages/api/src/core/repositories/hotels/hotel.repository.ts`
- [X] T007 [P] Implement `status` storage/filtering in `packages/api/src/core/repositories/hotels/in-memory/in_memory_hotel_repository.ts` (depends on T006)
- [X] T008 [P] Implement `status` storage/filtering in `packages/api/src/core/repositories/hotels/implementation/postgres_hotel_repository.ts` (depends on T006, T004)
- [X] T009 [P] Add `status` to `hotel_shape`/`hotel_body_schema`/`hotel_update_schema` and a `status` querystring filter to the list schema in `packages/api/src/schemas/hotels/admin/hotels_schema.ts` (depends on T006)
- [X] T010 Wire `status` through create/update/list handlers in `packages/api/src/routes/hotels/admin/hotels_routes.ts` — satisfies T003 (depends on T005, T007, T008, T009)
- [X] T011 [P] Add `status: 'S' | 'N'` to the `Hotel`/`HotelFormData` interfaces and list params in `packages/admin/src/api/hoteis.service.ts`
- [X] T012 Add a status `Select` (Ativo/Inativo) to `packages/admin/src/pages/app/hoteis/editar.tsx`, mirroring the existing Grupo edit form's status control (depends on T011)
- [X] T013 [P] Add `status: 'S'` to the mock hotel fixtures/handlers in `packages/admin/src/mocks/handlers/hoteis_handlers.ts`

**Checkpoint**: Hotels can be toggled active/inactive end-to-end and filtered by status. US1 and US2 can now proceed.

---

## Phase 3: User Story 1 — Admin opens Suporte and sees active hotels (Priority: P1) 🎯 MVP

**Goal**: The admin app has a "Suporte" menu item showing a searchable, paginated list of active hotels only.

**Independent Test**: Log in as an admin, open "Suporte", confirm only active hotels appear, with search/pagination/empty-state all working — no "Access" behavior needed yet to consider this story complete.

### Tests for User Story 1 (write first, confirm failing)

- [X] T014 [P] [US1] Write `packages/admin/src/pages/app/suporte/index.spec.tsx`: renders active hotels, excludes inactive (via `status=S` param), shows empty state when none, reuses search/pagination
- [X] T015 [P] [US1] Add MSW handlers for `GET /admin/hoteis?status=S` (populated + empty responses) in `packages/admin/src/mocks/handlers/suporte_handlers.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Add a "Suporte" nav item to `packages/admin/src/components/layout/Sidebar.tsx`
- [X] T017 [US1] Create `packages/admin/src/pages/app/suporte/index.tsx`: list active hotels via `hoteisService.list({ status: 'S', ...pagination })`, reusing `DataTable`/`SearchBar`/`DataTablePagination`/`ResultCount`, with an empty-state message — satisfies T014 (depends on T014, T015, T011)
- [X] T018 [US1] Register the `/suporte` route pointing at the new page in `packages/admin/src/routes.tsx` (depends on T017)

**Checkpoint**: US1 is fully functional and independently testable/demoable.

---

## Phase 4: User Story 2 — Admin accesses a hotel as a chosen user (Priority: P1)

**Goal**: One click from the Suporte list opens the hotel's web app in a new tab, already authenticated as a chosen user of that hotel — with no page/form added to `packages/web`.

**Independent Test**: Click "Access" on an active hotel, pick one of its users, confirm — a new tab lands on the web app already logged in as that user, showing a support-mode banner; the whole flow completes in one click plus one confirm, per SC-001.

### Tests for User Story 2 (write first, confirm failing)

- [X] T019 [P] [US2] Write `packages/api/src/core/usecases/suporte/criar_suporte_acesso_use_case.spec.ts` using in-memory `Hotel`/`User`/`Route` repositories: hotel not found, hotel inactive, user not found or belongs to a different hotel, success returns `{ user, hotel, rotas }`
- [X] T020 [P] [US2] Add `GET /admin/hoteis/:id/usuarios` cases to `packages/api/src/routes/hotels/admin/hotels_routes.spec.ts`: returns the hotel's users, 404 when hotel not found
- [X] T021 [P] [US2] Write `packages/api/src/routes/suporte/admin/suporte_routes.spec.ts` (Fastify `inject`, in-memory fakes): success → `302`, `Location: WEB_APP_URL`, `Set-Cookie` with a `suporte` JWT claim; hotel not found → `404` HTML; hotel inactive → `409` HTML; user not in hotel → `404` HTML; no admin session → `401`
- [X] T022 [P] [US2] Add cases to `packages/api/src/routes/auth/web/auth_routes.spec.ts`: `GET /auth/me` includes `suporte` when the JWT carries the claim, omits it otherwise
- [X] T023 [P] [US2] Write `packages/web/src/contexts/AuthContext.spec.tsx` cases for the new passive bootstrap: calls `GET /auth/me` on mount when no cached session exists; populates session (incl. `suporte`) on success; leaves session `null` on 401
- [X] T024 [P] [US2] Write `packages/web/src/components/layout/SupportBanner.spec.tsx`: renders only when `session.suporte` is present; "Encerrar" triggers logout
- [X] T025 [P] [US2] Add user-picker dialog cases to `packages/admin/src/pages/app/suporte/index.spec.tsx`: lists a hotel's users, shows disabled state + "Este hotel não possui usuários" message for zero users (FR-011), confirming with a selection triggers `window.open` with the expected URL

### Implementation for User Story 2

- [X] T026 [P] [US2] Create `packages/api/src/core/usecases/suporte/criar_suporte_acesso_use_case.ts` — satisfies T019
- [X] T027 [P] [US2] Add `GET /admin/hoteis/:id/usuarios` handler to `packages/api/src/routes/hotels/admin/hotels_routes.ts`, reusing `IUserRepository.list(hotelId, ...)` — satisfies T020
- [X] T028 [P] [US2] Create `packages/api/src/schemas/suporte/admin/suporte_schema.ts` (querystring `usuario_id`, error response shapes)
- [X] T029 [P] [US2] Extend `PayloadJWTSchema` and the `request.user`/`FastifyJWT` types in `packages/api/src/plugins/auth_plugin.ts` with an optional `suporte: { administratorId, administratorNome }` claim
- [X] T030 [US2] Create `packages/api/src/routes/suporte/admin/suporte_routes.ts`: `GET /admin/hoteis/:id/suporte-acesso` — call the use case, sign the JWT with the `suporte` claim and a 30-minute expiry, set the `token` cookie, emit a `request.log.info` audit line, `reply.redirect(WEB_APP_URL)`; render a small HTML error body for 404/409 — satisfies T021 (depends on T026, T028, T029)
- [X] T031 [US2] Register `admin_suporte_routes` in `packages/api/src/plugins/fastify_routes.ts` (depends on T030)
- [X] T032 [P] [US2] Update `GET /auth/me` in `packages/api/src/routes/auth/web/auth_routes.ts` to include `suporte` when present in the decoded JWT — satisfies T022 (depends on T029)
- [X] T033 [P] [US2] Add `SuporteSession` and `LoginResponse.suporte?` to `packages/.contracts/src/auth.ts`
- [X] T034 [US2] Add `suporte?: SuporteSession` to the `MeResponse`/login response typings in `packages/web/src/api/auth.service.ts` (depends on T033)
- [X] T035 [US2] Update `packages/web/src/contexts/AuthContext.tsx`: on mount, if no cached session exists, call `GET /auth/me`; populate session (incl. `suporte`) on success — satisfies T023 (depends on T034)
- [X] T036 [P] [US2] Create `packages/web/src/components/layout/SupportBanner.tsx` — satisfies T024 (depends on T034)
- [X] T037 [US2] Render `<SupportBanner />` inside `packages/web/src/pages/_layouts/app.tsx` when `session.suporte` is present (depends on T035, T036)
- [X] T038 [P] [US2] Create `packages/admin/src/api/suporte.service.ts`: `listarUsuarios(hotelId)` (`GET /admin/hoteis/:id/usuarios`) and a `buildAcessoUrl(hotelId, usuarioId)` helper (no `fetch` — just URL construction for `window.open`)
- [X] T039 [US2] Add the user-picker dialog and "Acessar" button to `packages/admin/src/pages/app/suporte/index.tsx`: fetch users on open, disable confirm + show message for zero users (FR-011), on confirm call `window.open(buildAcessoUrl(...), '_blank')` — satisfies T025 (depends on T038, and on US1's T017)
- [X] T040 [US2] Add `GET /admin/hoteis/:id/usuarios` handlers to `packages/admin/src/mocks/handlers/suporte_handlers.ts` (depends on T015's file)

**Checkpoint**: US2 is fully functional — the full one-click access flow works end-to-end per quickstart.md scenarios 2–5.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T041 [P] Run `pnpm --filter api test`, `pnpm --filter admin test`, `pnpm --filter web test` — confirm everything is green
- [X] T042 [P] Run `pnpm --filter api typecheck`, `pnpm --filter admin typecheck`, `pnpm --filter web typecheck`
- [X] T043 Walk through `quickstart.md` scenarios 1–5 end-to-end manually (real Postgres, all three dev servers running)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational only for its API-side and web-side work; its admin-side task T039 additionally depends on US1's T017 (same file: `pages/app/suporte/index.tsx`)
- **Polish (Phase 5)**: Depends on both user stories being complete

### Within Each Story

- Tests written and failing before implementation (strict TDD, per project `CLAUDE.md` files)
- Entities/schemas before repositories before routes
- Backend (`packages/api`) work is independent of frontend (`packages/admin`/`packages/web`) work within US2 and can proceed in parallel — they only meet at the manual quickstart validation

### Parallel Opportunities

- T002/T003 (Foundational tests) in parallel
- T005/T007/T008/T009 (Foundational implementation, once T006 lands) in parallel
- T011/T013 (admin-side Foundational) in parallel with all backend Foundational tasks
- All of T014/T015 (US1 tests) in parallel
- All of T019–T025 (US2 tests) in parallel — they span 5 different files across 3 packages
- T026/T027/T028/T029 (US2 backend implementation) in parallel, once their respective tests exist
- T033/T036/T038 (US2 cross-package implementation) in parallel with each other

---

## Parallel Example: User Story 2 tests

```bash
Task: "criar_suporte_acesso_use_case.spec.ts — hotel/user validation cases"
Task: "hotels_routes.spec.ts — GET /admin/hoteis/:id/usuarios cases"
Task: "suporte_routes.spec.ts — redirect/cookie/error cases"
Task: "auth_routes.spec.ts — GET /auth/me suporte field cases"
Task: "AuthContext.spec.tsx — passive bootstrap cases"
Task: "SupportBanner.spec.tsx — render/logout cases"
Task: "suporte/index.spec.tsx — user-picker dialog cases"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 (Setup) → Phase 2 (Foundational: `Hotel.status`) — unblocks everything
2. Phase 3 (US1) — **STOP and VALIDATE**: `/suporte` lists only active hotels, searchable/paginated
3. Phase 4 (US2) — the actual access flow; both stories are P1, so both are needed for a meaningful MVP, but US1 alone is independently demoable
4. Phase 5 (Polish): full test/typecheck run + manual quickstart walkthrough

### Incremental Delivery

1. Setup + Foundational → hotel status exists and is toggleable
2. US1 → Suporte list is browsable (no access yet) → demo
3. US2 → one-click access works end-to-end → demo (full feature)

---

## Notes

- No `[P]` conflicts: no two `[P]`-marked tasks in the same phase touch the same file.
- T039 and T040 are intentionally **not** marked `[P]` even though they're technically different files from most of their phase — T039 depends on US1's `index.tsx` (cross-story same-file edit) and T040 edits a file already created in Phase 3.
- Per explicit product constraints: no `SuporteAcesso` database table (audit is a log line — T030), and no new page/route/form in `packages/web` (T035–T037 only touch existing files).
