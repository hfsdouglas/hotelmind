---
description: "Task list for Repository Domain Structure & Route Refactoring"
---

# Tasks: Repository Domain Structure & Route Refactoring

**Feature**: `001-api-structure-refactor`
**Input**: `specs/001-api-structure-refactor/plan.md`
**Prerequisites**: plan.md ✅, quickstart.md ✅

**Note**: `spec.md` was not filled in for this refactor feature.
User stories are derived directly from the plan's three implementation phases.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: Which plan phase this task belongs to (US1, US2, US3)
- Exact file paths in every description (relative to `packages/api/src/`)

---

## Phase 1: Setup

**Purpose**: Verify the baseline is clean before any file is moved or deleted.

- [X] T001 Confirm `pnpm tsc --noEmit` passes with zero errors in `packages/api` (baseline snapshot)

---

## Phase 2: Foundational — Move Prisma Client

**Purpose**: All new repository files import from `@/db/client`. This MUST exist
before any repository file is created.

**⚠️ CRITICAL**: T002 blocks T003 and T004.

- [X] T002 Create `src/db/client.ts` — copy all content from `src/lib/prisma.ts`
  verbatim; change nothing else

**Checkpoint**: `src/db/client.ts` exists and exports the Prisma client instance. ✅

---

## Phase 3: US1 — Repository Domain Structure (P1)

**Goal**: Reorganize repositories into domain folders with `implementation/` and
`in-memory/` sub-folders, expose a central re-export index, then delete the old
flat files.

**Independent Test**: `pnpm tsc --noEmit` passes; no file under `packages/api/src`
imports from `lib/prisma`, `prisma_hotel_repository`, or `prisma_user_repository`.

### Implementation for US1

- [X] T003 [P] [US1] Create `src/db/repositories/hotels/implementation/postgres_hotel_repository.ts`
  — copy class from `src/db/repositories/prisma_hotel_repository.ts`; rename class
  to `PostgresHotelRepository`; update `import { db }` to read from `@/db/client`
  (depends on T002)

- [X] T004 [P] [US1] Create `src/db/repositories/users/implementation/postgres_user_repository.ts`
  — copy class from `src/db/repositories/prisma_user_repository.ts`; rename class
  to `PostgresUserRepository`; update `import { db }` to read from `@/db/client`
  (depends on T002)

- [X] T005 [P] [US1] Create `src/db/repositories/hotels/in-memory/in_memory_hotel_repository.ts`
  — implement `IHotelRepository` interface from `@/core/repositories/hotel_repository`;
  use `Map<string, Hotel>` as store; expose `seed(hotel: Hotel): void` helper method

- [X] T006 [P] [US1] Create `src/db/repositories/users/in-memory/in_memory_user_repository.ts`
  — implement `IUserRepository` interface from `@/core/repositories/user_repository`;
  use `Map<string, User>` as store; expose `seed(user: User): void` helper method

- [X] T007 [US1] Create `src/db/repositories/index.ts` — re-export
  `PostgresHotelRepository as HotelRepository` from `./hotels/implementation/postgres_hotel_repository`
  and `PostgresUserRepository as UserRepository` from `./users/implementation/postgres_user_repository`
  (depends on T003, T004)

- [X] T008 [US1] Delete `src/db/repositories/prisma_hotel_repository.ts` — first
  run `grep -r "prisma_hotel_repository" packages/api/src --include="*.ts"` to
  confirm no remaining imports outside the old file itself

- [X] T009 [US1] Delete `src/db/repositories/prisma_user_repository.ts` — first
  run `grep -r "prisma_user_repository" packages/api/src --include="*.ts"` to
  confirm no remaining imports

- [X] T010 [US1] Delete `src/lib/prisma.ts` — first run
  `grep -r "lib/prisma" packages/api/src --include="*.ts"` to confirm zero imports
  remain (depends on T002 being complete and all consumers updated)
  Note: `src/db/seeds/index.ts` import was also updated to `@/db/client`.

**Checkpoint**: `pnpm tsc --noEmit` in `packages/api` passes with zero errors. ✅
`grep` returns zero matches. ✅

---

## Phase 4: US2 — Route Refactoring (P2)

**Goal**: Refactor `auth_routes.ts` to a named factory export; update
`fastify-routes.ts` to own dependency instantiation; register `authPlugin` in
`server.ts` before routes.

**Independent Test**: Server starts with `pnpm dev` and all four quickstart.md
curl commands return the expected status codes.

### Implementation for US2

- [X] T011 [US2] Refactor `src/routes/auth/auth_routes.ts`:
  - Replace `const auth_routes: FastifyPluginAsyncZod = async (app) => { ... }`
    with `export function auth_routes(login_use_case: LoginUseCase) { return async function(app: FastifyTypedInstance) { ... } }`
  - Import `FastifyTypedInstance` from `@/types/fastify` (or wherever it is declared)
  - Import `LoginUseCase` from `@/core/usecases/login_use_case` (for the parameter type only)
  - Remove all `new PrismaUserRepository(...)`, `new PrismaHotelRepository(...)`, `new BcryptPasswordHasher()` instantiations from this file
  - Replace `(app as unknown as FastifyInstance).authenticate` with `app.authenticate` directly
  - Remove `export default auth_routes`
  - Keep all route paths, schemas, and response logic identical

- [X] T012 [US2] Update `src/plugins/fastify-routes.ts`:
  - Add imports: `HotelRepository`, `UserRepository` from `@/db/repositories`;
    `db` from `@/db/client`; `BcryptPasswordHasher` from `@/lib/bcrypt_password_hasher`;
    `LoginUseCase` from `@/core/usecases/login_use_case`;
    `auth_routes` (named import) from `@/routes/auth/auth_routes`
  - Update `setRoutes` parameter type to `FastifyTypedInstance`
  - Inside `setRoutes`: instantiate `new UserRepository(db)`, `new HotelRepository(db)`,
    `new BcryptPasswordHasher()`, `new LoginUseCase(userRepo, hotelRepo, hasher)`
  - Call `app.register(auth_routes(login_use_case))` instead of `app.register(auth_routes)`
  - Remove the old `import auth_routes from '...'` default import
  (depends on T007, T011)

- [X] T013 [US2] `src/server.ts` — No change needed.
  `setJWT` already registers `authPlugin` internally; adding it again would cause
  a double-decorator error. The plan assumed authPlugin was missing; it was already
  present. The TypeScript issue was resolved by adding `/// <reference path>` to
  `src/types/fastify.ts`.
  (depends on T012)

**Checkpoint**: `pnpm tsc --noEmit` passes with zero errors. ✅

---

## Phase 5: US3 — Tests (P3)

**Goal**: Write unit tests for `LoginUseCase` using in-memory fakes, and an HTTP
integration test for auth routes using Fastify `inject()`.

**Independent Test**: `pnpm test` in `packages/api` runs both spec files and both
pass with no database connection required.

### Implementation for US3

- [X] T014 [P] [US3] Create `src/core/usecases/login_use_case.spec.ts`:
  - Import `InMemoryUserRepository` from `@/db/repositories/users/in-memory/in_memory_user_repository`
  - Import `InMemoryHotelRepository` from `@/db/repositories/hotels/in-memory/in_memory_hotel_repository`
  - Seed a user with a known bcrypt-hashed password and a linked hotel
  - Test: valid credentials → returns `{ user, hotel }`
  - Test: wrong password → throws `AuthenticationError`
  - Test: unknown email → throws `AuthenticationError`
  - No Prisma, no real database
  (depends on T005, T006)

- [X] T015 [P] [US3] Create `src/routes/auth/auth_routes.spec.ts`:
  - Build a minimal Fastify instance with `fastify-type-provider-zod` and the JWT/auth plugins
  - Register `auth_routes(login_use_case)` where `login_use_case` is constructed
    with `InMemoryUserRepository` and `InMemoryHotelRepository` fakes
  - Test POST `/auth/login` with valid credentials → 200
  - Test POST `/auth/login` with invalid credentials → 401
  - Test GET `/auth/me` with a valid JWT cookie → 200
  - Test GET `/auth/me` without a cookie → 401
  - Use Fastify's built-in `app.inject()` for all requests; no real HTTP port
  (depends on T011, T014)

**Checkpoint**: `pnpm test` — 2 test files, 8 tests, all green. ✅

---

## Phase 6: Polish & Validation

**Purpose**: Final type-check, grep validation, Swagger smoke test.

- [X] T016 Run `pnpm tsc --noEmit` in `packages/api` — zero errors ✅

- [X] T017 [P] Run grep for old import paths — zero matches ✅

- [ ] T018 [P] Start server with `pnpm dev` and open `http://localhost:3000/docs`
  in a browser — confirm Swagger UI loads and all routes appear with schemas intact

- [ ] T019 Run the full quickstart.md validation sequence (sections 1–6):
  type check, tests, server start, four curl commands, Swagger UI, grep check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — T002 blocks T003 and T004
- **US1 (Phase 3)**: T003/T004 depend on T002; T005/T006 are free; T007 depends
  on T003+T004; T008/T009 depend on T007; T010 depends on T002+T007
- **US2 (Phase 4)**: Depends on T007 (central index) and T011 (route factory)
- **US3 (Phase 5)**: T014 depends on T005+T006; T015 depends on T011+T014
- **Polish (Phase 6)**: Depends on all phases complete

### Within Each Phase

| Task | Depends on |
|------|-----------|
| T002 | T001 |
| T003 | T002 |
| T004 | T002 |
| T005 | — |
| T006 | — |
| T007 | T003, T004 |
| T008 | T007 |
| T009 | T007 |
| T010 | T007 |
| T011 | — (can start anytime after T001) |
| T012 | T007, T011 |
| T013 | T012 |
| T014 | T005, T006 |
| T015 | T011, T014 |
| T016–T019 | T013, T015 |

### Parallel Opportunities

```bash
# After T002 completes — launch all four in parallel:
Task T003: Create postgres_hotel_repository.ts
Task T004: Create postgres_user_repository.ts
Task T005: Create in_memory_hotel_repository.ts
Task T006: Create in_memory_user_repository.ts

# T011 can also run in parallel with T003–T006 (different file, no shared dependency)

# After T007 and T011 complete — both route tasks can run in sequence:
Task T012: Update fastify-routes.ts
# Then:
Task T013: Update server.ts

# After T005, T006, T011 complete — launch in parallel:
Task T014: Write login_use_case.spec.ts
Task T015: Write auth_routes.spec.ts (after T014 complete)
```

---

## Implementation Strategy

### MVP (US1 Only — Verify Structure Before Routes)

1. Complete T001: baseline type check
2. Complete T002: move Prisma client
3. Complete T003–T006 in parallel: create all four repository files
4. Complete T007: create central index
5. Complete T008–T010: delete old files
6. **STOP and VALIDATE**: `pnpm tsc --noEmit` passes, grep returns zero matches
7. Proceed to US2 only after US1 is fully green

### Full Sequential Delivery

1. Setup → Foundational → US1 → US2 → US3 → Polish
2. Validate at each checkpoint before proceeding

---

## Notes

- [P] tasks = different files, no incomplete dependencies — safe to parallelize
- [Story] label maps each task to its plan phase for traceability
- T011 (route factory refactor) can be worked in parallel with US1 tasks since it
  touches a different file (`auth_routes.ts`) with no dependency on the repo index
- Delete tasks (T008–T010) MUST run after the grep confirms zero remaining imports
- Tests (US3) require no database — in-memory fakes only per constitution Principle VII
- Validate `pnpm tsc --noEmit` after each phase checkpoint before proceeding
