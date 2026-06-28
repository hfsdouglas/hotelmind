# Feature Specification: Route DI Ownership

**Feature Branch**: `002-route-di-ownership`

**Created**: 2026-06-28

**Status**: Draft

---

## Context

During feature `001-api-structure-refactor`, `auth_routes.ts` was refactored to a
factory function that receives a `LoginUseCase` instance as a parameter:

```ts
// current — WRONG
export function auth_routes(login_use_case: LoginUseCase) {
  return async function (app: FastifyTypedInstance) { ... }
}
```

`fastify-routes.ts` was updated to instantiate all dependencies and inject them:

```ts
// current — WRONG
export function setRoutes(app: FastifyTypedInstance) {
  const login_use_case = new LoginUseCase(
    new UserRepository(db),
    new HotelRepository(db),
    new BcryptPasswordHasher(),
  )
  app.register(auth_routes(login_use_case))
}
```

This is an architectural violation: plugin/router files must not know about domain
intent. Dependency composition belongs exclusively in the route.

---

## User Scenarios & Testing

### User Story 1 — Route composes its own dependencies (Priority: P1)

A developer adding a new route to this service creates a regular Fastify plugin
function. They import the use case, repositories, and services they need, instantiate
them at the top of the plugin body, and use them inside handlers. They do not touch
`fastify-routes.ts` beyond registering the new route plugin — no arguments, no
factory wrappers.

**Why this priority**: Every future route will follow this pattern. Establishing the
correct shape now prevents accumulation of the factory anti-pattern across the codebase.

**Independent Test**: `pnpm tsc --noEmit` passes; `auth_routes.ts` exports a plain
`async function`, not a factory; `fastify-routes.ts` calls `app.register(auth_routes)`
with no arguments.

**Acceptance Scenarios**:

1. **Given** `auth_routes.ts` exists, **When** a developer reads it, **Then** they
   see a standard Fastify plugin signature `export async function auth_routes(app: FastifyTypedInstance)`
   with use-case instantiation at the top of the function body.

2. **Given** `fastify-routes.ts` exists, **When** a developer reads it, **Then** they
   see only `app.register(auth_routes)` — no repositories, no use cases, no services.

3. **Given** the server is running, **When** `POST /auth/login` is called with valid
   credentials, **Then** it responds `200` with `user`, `hotel`, and `message` — identical
   behaviour to the previous implementation.

---

### User Story 2 — Route tests remain independent of the database (Priority: P2)

The `auth_routes.spec.ts` test suite exercises login and session-check behaviour
without a real PostgreSQL connection. Because the route now instantiates its own
dependencies, the test file uses Vitest module mocking to substitute the real
repositories with in-memory fakes before the route plugin is loaded.

**Why this priority**: Test isolation is non-negotiable per the project constitution
(Principle VII). No test should require a running database.

**Independent Test**: `pnpm test` completes with all route tests green and no
database connection attempted.

**Acceptance Scenarios**:

1. **Given** Vitest module mocks are set up to replace `UserRepository` and
   `HotelRepository` with in-memory equivalents, **When** `auth_routes.spec.ts` runs,
   **Then** all four route scenarios (login OK, login fail, `/me` with token,
   `/me` without token) pass.

2. **Given** the test environment has no `DATABASE_URL`, **When** the test suite
   runs, **Then** it completes without errors.

---

### Edge Cases

- `fastify-routes.ts` must not import any class from `@/core/`, `@/db/`, or `@/lib/`
  after this change. A grep check confirms this.
- The `auth_routes` export must be a plain async function, not a function that
  returns a function. `typeof auth_routes` is `(app: FastifyTypedInstance) => Promise<void>`.

---

## Requirements

### Functional Requirements

- **FR-001**: `auth_routes.ts` MUST export `async function auth_routes(app: FastifyTypedInstance)`
  as a named export — no currying, no factory wrapper.
- **FR-002**: `auth_routes.ts` MUST instantiate `LoginUseCase`, `UserRepository`,
  `HotelRepository`, and `BcryptPasswordHasher` inside the plugin body before
  defining any route handlers.
- **FR-003**: `fastify-routes.ts` MUST call `app.register(auth_routes)` with no
  arguments and MUST NOT import from `@/core/`, `@/db/repositories`, or `@/lib/`.
- **FR-004**: `auth_routes.spec.ts` MUST use `vi.mock` to substitute real repositories
  with in-memory fakes; no real database connection required.
- **FR-005**: All existing endpoint behaviours (responses, status codes, cookies)
  MUST remain identical after the refactor.

### Key Entities

- **`auth_routes`**: Fastify plugin function — owns its own use-case composition.
- **`setRoutes`**: Thin router — only calls `app.register` for each route plugin.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: `pnpm tsc --noEmit` reports zero errors.
- **SC-002**: `pnpm test` reports all tests green with no database dependency.
- **SC-003**: `grep -r "UseCase\|Repository\|Hasher" packages/api/src/plugins/fastify-routes.ts`
  returns zero matches.
- **SC-004**: The four curl commands in `specs/001-api-structure-refactor/quickstart.md`
  return the same status codes as before.

---

## Assumptions

- The test approach for routes is Vitest module mocking (`vi.mock`) because the route
  now owns its own instantiation — in-memory fakes must be injected at the module level.
- `db/client.ts` is also mocked in route tests to avoid the `pg` Pool constructor
  attempting a real connection.
- No new packages are required; `vitest` already supports `vi.mock` out of the box.
- `login_use_case.spec.ts` is unaffected — use-case tests still inject fakes via
  the constructor and do not need mocking.
