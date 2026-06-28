---
description: "Task list for Route DI Ownership refactor"
---

# Tasks: Route DI Ownership

**Feature**: `002-route-di-ownership`
**Input**: `specs/002-route-di-ownership/plan.md`, `spec.md`, `research.md`

**Scope**: 3 files changed — `auth_routes.ts`, `fastify-routes.ts`,
`auth_routes.spec.ts`. Zero new files. Zero behavioural change to endpoints.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: Which user story (US1, US2)
- Exact file paths relative to `packages/api/src/`

---

## Phase 1: Setup

**Purpose**: Confirm baseline is green before touching anything.

- [X] T001 Run `npx tsc --noEmit` in `packages/api` and `pnpm test --run` — confirm
  both pass before the refactor begins (snapshot the known-good state)

---

## Phase 2: US1 — Route Composes Its Own Dependencies (P1)

**Goal**: `auth_routes.ts` becomes a standard Fastify plugin that owns its DI.
`fastify-routes.ts` is stripped down to a pure route registrar.

**Independent Test**: `npx tsc --noEmit` passes zero errors; grep confirms
`fastify-routes.ts` imports nothing from `@/core/`, `@/db/repositories`, or `@/lib/`.

### Implementation for US1

- [X] T002 [US1] Rewrite `src/routes/auth/auth_routes.ts`:
  - Change signature from `export function auth_routes(login_use_case: LoginUseCase)`
    returning an async function, to `export async function auth_routes(app: FastifyTypedInstance)`
  - Add imports at the top of the file: `db` from `@/db/client`;
    `UserRepository`, `HotelRepository` from `@/db/repositories`;
    `BcryptPasswordHasher` from `@/lib/bcrypt_password_hasher`;
    `LoginUseCase` from `@/core/usecases/login_use_case`
  - Instantiate inside the plugin body (before any `app.get`/`app.post`):
    ```ts
    const login_use_case = new LoginUseCase(
      new UserRepository(db),
      new HotelRepository(db),
      new BcryptPasswordHasher(),
    )
    ```
  - Remove the `login_use_case` parameter entirely from the function signature
  - Keep all route paths, schemas, handlers, cookie logic, and error handling identical

- [X] T003 [US1] Rewrite `src/plugins/fastify-routes.ts`:
  - Remove imports of `db`, `HotelRepository`, `UserRepository`,
    `BcryptPasswordHasher`, and `LoginUseCase`
  - Change `app.register(auth_routes(login_use_case))` to `app.register(auth_routes)`
  - Remove the entire dependency-instantiation block inside `setRoutes`
  - Final file: only two imports (`FastifyTypedInstance` and `auth_routes`) and
    one line in the function body (`app.register(auth_routes)`)
  (depends on T002)

- [X] T004 [US1] Run `npx tsc --noEmit` in `packages/api` — confirm zero errors
  (depends on T002, T003)

**Checkpoint**: Type check green. `grep -E "UseCase|Repository|Hasher|@/core|@/db/repositories|@/lib"
packages/api/src/plugins/fastify-routes.ts` returns zero matches.

---

## Phase 3: US2 — Route Tests Independent of Database (P2)

**Goal**: `auth_routes.spec.ts` uses `vi.mock` instead of constructor injection.
All four test scenarios pass with no database connection.

**Independent Test**: `pnpm test --run` in `packages/api` — both spec files green,
no `pg` Pool connection error.

### Implementation for US2

- [X] T005 [US2] Rewrite `src/routes/auth/auth_routes.spec.ts`:
  - Declare `let userRepo: InMemoryUserRepository` and
    `let hotelRepo: InMemoryHotelRepository` in outer scope (before any describe block)
  - Add at the top of the file (hoisted by Vitest before imports are resolved):
    ```ts
    vi.mock('@/db/client', () => ({ db: {} }))
    vi.mock('@/db/repositories', () => ({
      UserRepository: vi.fn().mockImplementation(() => userRepo),
      HotelRepository: vi.fn().mockImplementation(() => hotelRepo),
    }))
    ```
  - In `beforeEach`: assign fresh `InMemoryUserRepository` and
    `InMemoryHotelRepository` instances to `userRepo` and `hotelRepo`, then seed
    them with the test hotel and hashed-password user
  - Remove the `build_app` helper's manual use-case construction and the
    `auth_routes(login_use_case)` call — replace with plain `app.register(auth_routes)`
  - Keep all four test scenarios identical: POST login 200, POST login 401,
    GET /me with valid cookie 200, GET /me without cookie 401
  (depends on T002 — route must be a plain plugin before this spec can work)

- [X] T006 [US2] Run `pnpm test --run` in `packages/api` — confirm all 8 tests
  pass; confirm no `pg` connection error in output
  (depends on T005)

**Checkpoint**: `pnpm test --run` — 2 files, 8 tests, all green, no database needed.

---

## Phase 4: Polish & Validation

**Purpose**: Structural grep checks matching the spec's success criteria.

- [X] T007 [P] Verify `fastify-routes.ts` has no domain imports:
  ```bash
  grep -E "UseCase|Repository|Hasher|@/core|@/db/repositories|@/lib" \
    packages/api/src/plugins/fastify-routes.ts
  ```
  Expected: zero matches (SC-003)

- [X] T008 [P] Verify `auth_routes.ts` is a plain plugin (not a factory):
  ```bash
  grep "export async function auth_routes" packages/api/src/routes/auth/auth_routes.ts
  grep "return async function\|return function" packages/api/src/routes/auth/auth_routes.ts
  ```
  Expected: first grep matches; second grep returns zero matches

---

## Dependencies & Execution Order

| Task | Depends on |
|------|-----------|
| T001 | — |
| T002 | T001 |
| T003 | T002 |
| T004 | T002, T003 |
| T005 | T002 (route must be plain plugin) |
| T006 | T005 |
| T007 | T003 |
| T008 | T002 |

T002 and T003 are sequential (T003 changes the call site for T002's new shape).
T004 and T005 can start in parallel once T002 and T003 are done — they touch
different files.

---

## Implementation Strategy

### MVP (US1 only)

1. T001: baseline check
2. T002: convert `auth_routes.ts`
3. T003: simplify `fastify-routes.ts`
4. T004: type check
5. **Validate**: grep confirms no domain imports in `fastify-routes.ts`

Proceed to US2 only after US1 is green.

### Full delivery

1. US1 (T001–T004) → US2 (T005–T006) → Polish (T007–T008)

---

## Notes

- This is a pure structural refactor — zero endpoint behaviour change
- `login_use_case.spec.ts` is NOT affected — use-case tests already inject
  fakes via constructor and need no changes
- The `vi.mock` closures in T005 capture `userRepo`/`hotelRepo` by reference;
  assigning new instances in `beforeEach` updates what the mock returns per test
- Do not add `vi.mock` to `login_use_case.spec.ts` — it doesn't need it
