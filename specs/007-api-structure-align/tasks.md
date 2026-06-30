---
description: "Task list for API Package Structural Alignment"
---

# Tasks: API Package Structural Alignment

**Input**: Design documents from `specs/007-api-structure-align/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅

**Note**: No test tasks generated — the feature has no new logic, only structural moves. Verification is done by running the existing test suite and TypeScript compiler.

**Reference files**:
- `specs/007-api-structure-align/data-model.md` — complete move inventory (Groups A–G)
- `specs/007-api-structure-align/research.md` — full import site tables per domain
- `specs/007-api-structure-align/quickstart.md` — 10-step validation checklist

---

## Phase 1: Setup — Baseline Verification

**Purpose**: Confirm the starting state is green before any changes.

- [X] T001 Verify full test suite passes with `pnpm test` in `packages/api/` and record result as baseline

---

## Phase 2: Foundational — Prisma Client Relocation (US3)

**Purpose**: Move the Prisma singleton to its documented home before migrating repository files, so every new file written in Phase 3 can reference the correct path from the start.

**⚠️ CRITICAL**: Complete T002 and T003 before Phase 3. All implementation files being created in Phase 3 import from `@/lib/prisma`; this path must exist.

- [X] T002 Create `packages/api/src/lib/prisma.ts` with identical content from `packages/api/src/db/client.ts`, then delete `packages/api/src/db/client.ts`
- [X] T003 Update all 17 `@/db/client` → `@/lib/prisma` imports across route files, repository implementations, and seed file (see research.md Finding 5 for the full list)

**Checkpoint**: `packages/api/src/lib/prisma.ts` exists; `packages/api/src/db/client.ts` does not; `grep -r "@/db/client" src` returns zero results; TypeScript compiles.

---

## Phase 3: User Story 1 — Repository Domain Migration

**Goal**: Every domain lives entirely under `core/repositories/<domain>/`. The `db/repositories/` directory is deleted.

**Independent Test**: `find src/db -type f | grep -v seeds` returns zero results; TypeScript compiles; all tests pass.

**⚠️ Dependency note**: T009 (usuarios) MUST run after T008 (grupos) because `usuario.repository.ts` imports `PaginationInput`/`PaginatedResult` from `grupo.repository.ts`. All other domain tasks (T004–T010) are mutually independent and can run in parallel.

**Migration pattern per domain** (repeat for each task below):
1. Create target directory structure (subdirs: `implementation/`, `in-memory/` if applicable)
2. Write contract file at new path with dot-notation name (e.g., `user.repository.ts`)
3. Write implementation file at new path — update internal imports: old `@/core/repositories/<name>_repository` → new `@/core/repositories/<domain>/<name>.repository`; `@/db/client` already updated in T002–T003
4. Write in-memory fake at new path (if exists) — update internal imports the same way
5. Update all **external consumers** (use cases, routes, spec files) that import from the old flat contract path or old `db/repositories/<domain>/...` path — see research.md Finding 3 and Finding 4 per-domain tables

### Implementation

- [X] T004 [P] [US1] Migrate `users` domain: create `src/core/repositories/users/`, write `user.repository.ts` (from `user_repository.ts`), write implementation + in-memory fake at new paths with updated imports; update `login_use_case.ts`, `login_use_case.spec.ts`, and `auth_routes.spec.ts` import paths
- [X] T005 [P] [US1] Migrate `hotels` domain: create `src/core/repositories/hotels/`, write `hotel.repository.ts` (from `hotel_repository.ts`), write implementation + in-memory fake at new paths with updated imports; update `login_use_case.ts`, `login_use_case.spec.ts`, and `auth_routes.spec.ts` import paths
- [X] T006 [P] [US1] Migrate `rotas` domain: create `src/core/repositories/rotas/`, write `rota.repository.ts` (from `rota_repository.ts`), write implementation at new path with updated imports; update `login_use_case.ts` and `rotas_routes.ts` import paths
- [X] T007 [P] [US1] Migrate `administrators` domain: create `src/core/repositories/administrators/`, write `administrator.repository.ts` (from `administrator_repository.ts`), write implementation at new path with updated imports; update `admin_login_use_case.ts`, `admin_auth_routes.ts`, and `admin_administradores_routes.ts` import paths
- [X] T008 [P] [US1] Migrate `admin` domain: create `src/core/repositories/admin/`, write `admin_hotel.repository.ts` and `admin_rota.repository.ts` (from flat files), write both implementations at new paths with updated imports; update `admin_hoteis_routes.ts` and `admin_rotas_routes.ts` import paths
- [X] T009 [US1] Migrate `grupos` domain: create `src/core/repositories/grupos/`, write `grupo.repository.ts` (from `grupo_repository.ts`), write implementation + in-memory fake at new paths with updated imports; update all `core/usecases/grupos/*.ts` files, `grupos_routes.ts`, and `grupos_routes.spec.ts` and `create_grupo_use_case.spec.ts` and `delete_grupo_use_case.spec.ts` import paths; update `list_usuarios_use_case.ts` cross-import of `PaginationInput`/`PaginatedResult`
- [X] T010 [US1] Migrate `usuarios` domain (DEPENDS ON T009): create `src/core/repositories/usuarios/`, write `usuario.repository.ts` (from `usuario_repository.ts`) with updated cross-import from `@/core/repositories/grupos/grupo.repository`, write implementation + in-memory fake at new paths; update all `core/usecases/usuarios/*.ts` files and `usuarios_routes.ts` import paths

### Cleanup

- [X] T011 [US1] Delete the 8 old flat contract files from `src/core/repositories/` (e.g., `user_repository.ts`, `grupo_repository.ts`, etc.) — only after T004–T010 complete and TypeScript compiles
- [X] T012 [US1] Delete `src/db/repositories/` directory and all remaining contents — only after T011 passes compilation

**Checkpoint**: `find src/db -type f | grep -v seeds` returns zero results; `grep -r "@/db/repositories" src` returns zero results; `grep -r "@/core/repositories/grupo_repository\|@/core/repositories/user_repository\|@/core/repositories/hotel_repository\|@/core/repositories/rota_repository\|@/core/repositories/usuario_repository\|@/core/repositories/administrator_repository\|@/core/repositories/admin_hotel_repository\|@/core/repositories/admin_rota_repository" src` returns zero results; all tests pass.

---

## Phase 4: User Story 2 — Populate the Central Re-export Index

**Goal**: `core/repositories/index.ts` exports every concrete implementation under a stable domain alias. Route files that used to import from `@/db/repositories` (the old index) now import from `@/core/repositories`.

**Independent Test**: A route file can import `{ HotelRepository }` from `@/core/repositories` and TypeScript resolves it; `grep -r "@/db/repositories" src` returns zero results.

- [X] T013 [US2] Write `src/core/repositories/index.ts` with 8 re-exports mapping all domain aliases (see research.md Finding 2 for exact export content)
- [X] T014 [US2] Update `src/routes/auth/auth_routes.ts`: change `import { HotelRepository, UserRepository } from '@/db/repositories'` → `import { HotelRepository, UserRepository } from '@/core/repositories'`

**Checkpoint**: `grep -r "@/db/repositories" src` returns zero results; `grep "export" src/core/repositories/index.ts | wc -l` returns 8 or more; TypeScript compiles; all tests pass.

---

## Phase 5: User Story 4 — Plugin File Renames

**Goal**: Every file in `src/plugins/` uses snake_case with no hyphens.

**Independent Test**: `ls src/plugins/ | grep -` returns zero results (empty output); `server.ts` imports all plugins without error.

**Note**: Rename `auth_plugin.ts` and `admin_auth_plugin.ts` first (T015, T016) so `jwt_plugin.ts` (T017) can update its internal imports to the new names in the same step.

- [X] T015 [P] [US4] Rename `src/plugins/auth-plugin.ts` → `src/plugins/auth_plugin.ts` (content unchanged)
- [X] T016 [P] [US4] Rename `src/plugins/admin-auth-plugin.ts` → `src/plugins/admin_auth_plugin.ts` (content unchanged)
- [X] T017 [US4] Rename `src/plugins/fastify-jwt.ts` → `src/plugins/jwt_plugin.ts` AND update its two internal imports: `@/plugins/auth-plugin` → `@/plugins/auth_plugin`; `@/plugins/admin-auth-plugin` → `@/plugins/admin_auth_plugin` (DEPENDS ON T015, T016)
- [X] T018 [P] [US4] Rename `src/plugins/fastify-cookie.ts` → `src/plugins/cookie_plugin.ts` (content unchanged)
- [X] T019 [P] [US4] Rename `src/plugins/fastify-cors.ts` → `src/plugins/cors_plugin.ts` (content unchanged)
- [X] T020 [P] [US4] Rename `src/plugins/fastify-swagger.ts` → `src/plugins/swagger_plugin.ts` (content unchanged)
- [X] T021 [P] [US4] Rename `src/plugins/fastify-routes.ts` → `src/plugins/fastify_routes.ts` (content unchanged)
- [X] T022 [US4] Update `src/server.ts`: update 5 plugin import paths (`fastify-routes` → `fastify_routes`, `fastify-swagger` → `swagger_plugin`, `fastify-cors` → `cors_plugin`, `fastify-cookie` → `cookie_plugin`, `fastify-jwt` → `jwt_plugin`)
- [X] T023 [US4] Update spec files: `src/routes/auth/auth_routes.spec.ts` and `src/routes/grupos/grupos_routes.spec.ts` — change `@/plugins/auth-plugin` → `@/plugins/auth_plugin`

**Checkpoint**: `ls src/plugins/ | grep -` returns empty; TypeScript compiles; all tests pass.

---

## Phase 6: Polish & Final Validation

- [X] T024 Run `tsc --noEmit` in `packages/api/` and confirm zero TypeScript errors
- [X] T025 Run full test suite with `pnpm test` in `packages/api/` and confirm all tests pass (same or better than T001 baseline)
- [X] T026 Run all 10 validation steps from `specs/007-api-structure-align/quickstart.md` and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Baseline)**: No dependencies — run immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — T002 before T003
- **Phase 3 (US1 — Repository Migration)**: Depends on Phase 2 completion
  - T004, T005, T006, T007, T008 can run **in parallel** (independent domains)
  - T009 (grupos) must complete **before** T010 (usuarios) due to cross-import
  - T011 runs after all of T004–T010
  - T012 runs after T011
- **Phase 4 (US2 — Index)**: Depends on Phase 3 completion (T013, T014 after T012)
- **Phase 5 (US4 — Plugins)**: Independent of Phases 3 and 4 — can run in parallel with Phase 3
  - T015, T016 before T017
  - T018, T019, T020, T021 can run in parallel
  - T022, T023 after all plugin files are renamed
- **Phase 6 (Validation)**: After all other phases complete

### User Story Dependencies

- **US3 (P3 — Prisma move)**: No dependencies on other stories — done first as foundational
- **US1 (P1 — Repository migration)**: Depends on US3 (Prisma move)
- **US2 (P2 — Index)**: Depends on US1 completion
- **US4 (P4 — Plugins)**: Fully independent — can overlap with US1, US2, US3

### Within Phase 3

- T009 (grupos) → T010 (usuarios): grupos must complete first (PaginationInput cross-import)
- T004, T005, T006, T007, T008, T009 are all independent of each other (except the T009→T010 link)
- T011 (delete flat contracts) → T012 (delete db/repositories): must run in this order

---

## Parallel Execution Examples

### Phase 3 Parallel Batch (domains independent of each other)

```bash
# Can be launched simultaneously:
Task T004: Migrate users domain
Task T005: Migrate hotels domain
Task T006: Migrate rotas domain
Task T007: Migrate administrators domain
Task T008: Migrate admin domain

# After all above complete:
Task T009: Migrate grupos domain
Task T010: Migrate usuarios domain (after T009)

# Then:
Task T011: Delete flat contracts
Task T012: Delete db/repositories/
```

### Phase 5 Parallel Batch (plugin renames)

```bash
# Can be launched simultaneously (and in parallel with Phase 3 if separate developer):
Task T015: Rename auth-plugin.ts → auth_plugin.ts
Task T016: Rename admin-auth-plugin.ts → admin_auth_plugin.ts
Task T018: Rename fastify-cookie.ts → cookie_plugin.ts
Task T019: Rename fastify-cors.ts → cors_plugin.ts
Task T020: Rename fastify-swagger.ts → swagger_plugin.ts
Task T021: Rename fastify-routes.ts → fastify_routes.ts

# After T015 and T016:
Task T017: Rename fastify-jwt.ts → jwt_plugin.ts + update its internal imports

# After all plugin files renamed:
Task T022: Update server.ts imports
Task T023: Update spec file imports
```

---

## Implementation Strategy

### MVP Scope (US1 only — minimum viable alignment)

1. Complete Phase 1 (baseline)
2. Complete Phase 2 (Prisma client move) — T002, T003
3. Complete Phase 3 (repository migration) — T004–T012
4. **VALIDATE**: `find src/db -type f | grep -v seeds` → zero results; tests green
5. Continue with Phases 4 and 5 to finish the full spec

### Incremental Delivery

1. Phase 2: Prisma client move → validate → continue
2. Phase 3: Domain-by-domain (one domain at a time, test after each) → validate all
3. Phase 4: Populate index → validate
4. Phase 5: Plugin renames → validate
5. Phase 6: Final full validation

---

## Notes

- `[P]` tasks operate on different files — safe to run simultaneously
- `[US]` label maps each task to its user story for traceability
- Domain migration tasks follow a strict internal order: contract → implementation → fake → consumer updates
- The critical dependency: **T009 (grupos) before T010 (usuarios)** — `usuario.repository.ts` cross-imports `PaginationInput`/`PaginatedResult` from `grupo.repository.ts`
- Do NOT delete old files (T011, T012) until ALL new files are written and TypeScript compiles
- After T012, `db/` will contain only `seeds/index.ts`
