# Implementation Plan: Personalized Login Greeting

**Branch**: `003-login-welcome-name` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-login-welcome-name/spec.md`

## Summary

The login endpoint (`POST /auth/login`) currently returns `"Bem-vindo!"` as the
`message` field. This feature changes it to `"Seja bem-vindo, {first_name}!"`,
where `first_name` is derived from the first word of the user's `nome_completo`.

The extraction logic lives as a `get first_name()` getter on the `User` domain
entity. The route handler reads `user.first_name` and composes the greeting
string. No new fields, no schema changes, no migrations.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+)

**Primary Dependencies**: Fastify 5.x, Zod, Vitest 4.x — no new packages

**Storage**: PostgreSQL via Prisma — no schema changes; `nome_completo` already exists

**Testing**: Vitest — update `auth_routes.spec.ts`, add `user.spec.ts`

**Target Platform**: Linux server (API package in pnpm monorepo)

**Project Type**: HTTP microservice

**Performance Goals**: N/A — pure in-memory string operation

**Constraints**: Zero new dependencies, zero database migrations

**Scale/Scope**: 3 files changed, 1 file created

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| I. Contract-First | ✅ PASS | Only intra-package schema (`login_schema.ts`); `message: z.string()` already covers new format — no change required |
| II. Clean Architecture | ✅ PASS | `first_name` getter lives in `core/entities/user.ts` (domain layer). Route reads `user.first_name` and builds the response string — dependency points inward |
| III. SOLID | ✅ PASS | Getter adds one cohesive behavior to `User`. No existing methods modified |
| IV. Explicit over Implicit | ✅ PASS | Getter is a named, visible property. Fallback for empty name is explicit (FR-004) |
| V. Low Coupling | ✅ PASS | Route depends only on `User` domain type, which it already imports |
| VI. Clean Code | ✅ PASS | Getter is one line; extraction rule is expressed in one place |
| VII. Testability | ✅ PASS | Getter tested in `user.spec.ts` without any framework dependency |

**Result**: No violations. No Complexity Tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/003-login-welcome-name/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── login_response.md
└── tasks.md             ← /speckit-tasks output (not yet created)
```

### Source Code (affected files only)

```text
packages/api/src/
├── core/
│   └── entities/
│       ├── user.ts                          # add get first_name(): string
│       └── user.spec.ts                     # new — test getter
└── routes/
    └── auth/
        ├── auth_routes.ts                   # message: `Seja bem-vindo, ${user.first_name}!`
        └── auth_routes.spec.ts              # update message assertion
```

## Design Decisions

### 1. Where does `first_name` live? → `User` entity

**Decision**: `get first_name(): string` getter on `core/entities/user.ts`.

**Rationale**: "Which word of `nome_completo` identifies the user's first name" is a
domain rule, not a presentation rule. Placing it on the entity makes it reusable by
any use case or route without duplication. The route remains ignorant of string
manipulation.

**Alternatives rejected**:
- Route-level extraction (`nome_completo.split(' ')[0]` inline) — leaks business logic
  into the presentation layer, duplicable across future greeting contexts.
- Use-case returning `first_name` in result — over-engineering for a pure property
  derivable from an already-returned entity.

### 2. Where is the greeting assembled? → Route handler

**Decision**: The route builds `"Seja bem-vindo, ${user.first_name}!"`.

**Rationale**: The exact wording and format of an HTTP response message is a
presentation concern. The route handler is the appropriate place for response
composition. The use case already returns the `User` entity; no changes to the
use-case interface are needed.

### 3. Schema change? → None required

**Decision**: `login_response_schema` already declares `message: z.string()`.
The new personalized string satisfies this schema without modification.

**Rationale**: Tightening the schema to a regex would couple the schema to a
presentation format, violating the schema's role as a shape contract. `z.string()`
is correct.

### 4. Empty name fallback (FR-004)

**Decision**: If `nome_completo.trim()` is empty, `first_name` returns `''`
and the greeting becomes `"Seja bem-vindo, !"` — the route detects an empty
`first_name` and falls back to `"Bem-vindo!"`.

**Alternative**: Place fallback entirely in the getter (return `''` on empty,
let the route decide). Chosen for cleaner separation: the getter provides the
first name, the route decides the message format.
