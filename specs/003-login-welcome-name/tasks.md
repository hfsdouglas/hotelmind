---
description: "Task list for Personalized Login Greeting"
---

# Tasks: Personalized Login Greeting

**Feature**: `003-login-welcome-name`
**Input**: `specs/003-login-welcome-name/plan.md`, `spec.md`, `research.md`

**Scope**: 3 files changed, 1 file created.
Single user story. No database migrations. No new dependencies.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: Which user story (US1)
- Exact file paths relative to `packages/api/src/`

---

## Phase 1: Setup

**Purpose**: Confirm baseline is green before touching anything.

- [X] T001 Run `pnpm test --run` and `npx tsc --noEmit` in `packages/api` — confirm
  both pass before any changes (snapshot the known-good state)

---

## Phase 2: US1 — Personalized Greeting on Login (P1) 🎯 MVP

**Goal**: `POST /auth/login` returns `"Seja bem-vindo, {first_name}!"` on success.

**Independent Test**: Send a POST to `/auth/login` with valid credentials for a user
whose `nome_completo` is `"Admin HotelMind"` and verify the response `message` equals
`"Seja bem-vindo, Admin!"`.

### Implementation for US1

- [X] T002 [US1] Add `get first_name(): string` getter to
  `src/core/entities/user.ts`:
  - Returns the first word of `nome_completo` after trimming whitespace
  - If `nome_completo.trim()` is empty, returns `''`
  - Pure derived property — no side effects, no constructor changes

- [X] T003 [P] [US1] Create `src/core/entities/user.spec.ts` with unit tests for
  the `first_name` getter:
  - Case 1: full name `"Admin HotelMind"` → `"Admin"`
  - Case 2: single-word name `"Maria"` → `"Maria"`
  - Case 3: name with leading/trailing spaces `"  João Silva  "` → `"João"`
  - Case 4: empty string `""` → `""`
  - No Fastify or DB imports — pure entity test
  (can run in parallel with T004, T005; all depend on T002 being complete first)

- [X] T004 [P] [US1] Update greeting message in `src/routes/auth/auth_routes.ts`:
  - Replace `message: 'Bem-vindo!'` with:
    ```ts
    message: user.first_name
      ? `Seja bem-vindo, ${user.first_name}!`
      : 'Bem-vindo!',
    ```
  (depends on T002; parallel with T003 and T005)

- [X] T005 [P] [US1] Update message assertion in
  `src/routes/auth/auth_routes.spec.ts`:
  - Line: `expect(body.message).toBe('Bem-vindo!')`
  - Change to: `expect(body.message).toBe('Seja bem-vindo, Admin!')`
  (depends on T002; parallel with T003 and T004)

**Checkpoint**: Run `pnpm test --run` — all tests green, including new `user.spec.ts`.

---

## Phase 3: Polish & Validation

**Purpose**: Confirm overall correctness and type safety.

- [X] T006 Run `pnpm test --run` in `packages/api` — confirm all tests pass
  (user.spec.ts + login_use_case.spec.ts + auth_routes.spec.ts)

- [X] T007 [P] Run `npx tsc --noEmit` in `packages/api` — confirm zero type errors

---

## Dependencies & Execution Order

| Task | Depends on |
|------|-----------|
| T001 | — |
| T002 | T001 |
| T003 | T002 |
| T004 | T002 |
| T005 | T002 |
| T006 | T003, T004, T005 |
| T007 | T004 |

T003, T004, and T005 are parallel once T002 is complete — they touch different files.

---

## Implementation Strategy

### MVP (only story, delivers full value)

1. T001: baseline check
2. T002: add `first_name` getter to `User` entity
3. T003 + T004 + T005 in parallel: tests + route update + spec update
4. T006 + T007: validate green

### Parallel execution for T003–T005

```bash
# All three touch different files — run together after T002:
Task T003: Create src/core/entities/user.spec.ts
Task T004: Update src/routes/auth/auth_routes.ts
Task T005: Update src/routes/auth/auth_routes.spec.ts
```

---

## Notes

- No Complexity Tracking — zero constitution violations
- `login_response_schema` stays as `message: z.string()` — no schema file changes
- `login_use_case.spec.ts` is unaffected — use-case tests don't touch the message
- The fallback `'Bem-vindo!'` (T004) satisfies FR-004 (empty name edge case)
