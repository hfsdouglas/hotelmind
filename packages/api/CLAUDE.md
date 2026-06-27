# API Package

Fastify HTTP server for this monorepo. This document is the authoritative guide for contributors and AI agents working in this package.

## Monorepo Context

**Read the root `CLAUDE.md` before doing anything else.**

This package is one service in a pnpm workspace monorepo. The root `CLAUDE.md` defines:

- Where to install dependencies (workspace root vs package-level)
- Tooling conventions (Biome, commit policy, workspace layout)
- Rules for shared utilities and cross-package code

Never install a dependency, create a shared abstraction, or move code between packages without first consulting the root `CLAUDE.md`.

## Technology Stack

### Runtime Dependencies

| Package | Purpose |
|---|---|
| `fastify` | HTTP framework |
| `@fastify/cookie` | Cookie support |
| `@fastify/cors` | CORS headers |
| `@fastify/jwt` | JWT authentication |
| `@fastify/swagger` | OpenAPI spec generation |
| `@fastify/swagger-ui` | Swagger UI endpoint |
| `fastify-type-provider-zod` | Zod type provider for Fastify |
| `zod` | Schema validation and type inference |
| `prisma` | ORM (query builder + migrations) |
| `pg` | PostgreSQL driver |

### Development Dependencies

| Package | Purpose |
|---|---|
| `typescript` | Type checking |
| `tsx` | TypeScript execution for dev/scripts |
| `vitest` | Test runner |
| `@types/node` | Node.js type definitions |

## Architecture Principles

This service follows Clean Architecture with explicit domain boundaries.

- **Clean Architecture** — dependencies point inward; domain never imports infrastructure
- **SOLID** — single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Separation of Concerns** — each layer owns one responsibility; do not leak concerns across boundaries
- **Dependency Inversion** — high-level modules (use cases) depend on abstractions (repository contracts), not concrete implementations (Prisma)
- **Framework Independence** — business logic must not import Fastify, Prisma, or any I/O library

If a piece of code cannot be tested without booting Fastify or connecting to a database, it belongs in the wrong layer.

## Naming Conventions

Use **snake_case** for all files, folders, route names, schemas, repositories, use cases, and services.

| Good | Bad |
|---|---|
| `create_user_use_case.ts` | `CreateUserUseCase.ts` |
| `user_repository.ts` | `userRepo.ts` |
| `auth_service.ts` | `AuthService.ts` |
| `users_routes.ts` | `usersRoutes.ts` |
| `create_user_schema.ts` | `createUserSchema.ts` |
| `jwt_plugin.ts` | `jwtPlugin.ts` |

No exceptions. Consistency enables grep and automation.

## Project Structure

```
src/
├── core/
│   ├── entities/         # Domain entities and business rules
│   ├── errors/           # Custom domain and application errors
│   ├── repositories/     # Repository contracts (interfaces only)
│   ├── services/         # Domain service contracts
│   └── usecases/         # Business workflows
│
├── config/               # Environment and configuration loading
├── db/                   # Prisma client, migrations, repository implementations
├── lib/                  # Third-party integration wrappers (not helpers.ts)
├── plugins/              # Fastify plugins (one file per plugin)
├── routes/               # Fastify route handlers
├── schemas/              # Zod request/response schemas
├── types/                # Shared TypeScript types and augmentations
│
└── server.ts             # Entry point: builds and starts the Fastify instance
```

## Layer Responsibilities

### `core/entities`

Domain entities and their invariants.

- Must not import Fastify, Prisma, `pg`, or any framework
- Entities encode business rules, not persistence concerns
- Constructor validation is acceptable; throw domain errors, not `Error`

### `core/errors`

Custom error classes for domain and application failures.

- Create a specific error class for every distinct failure mode
- Never `throw new Error('something went wrong')`
- Errors here may be caught by route handlers and mapped to HTTP status codes

### `core/repositories`

Repository contracts — TypeScript interfaces only.

- No implementations live here
- Implementations belong in `db/`
- Use cases depend on these interfaces, never on `db/` directly

### `core/services`

Domain service contracts and integration abstractions.

- Use for logic that does not belong to a single entity (e.g., password hashing, token generation)
- Keep as interfaces; implementations live in `lib/` or `db/`

### `core/usecases`

Application use cases — the orchestration layer.

- One use case per file, one public method (`execute`)
- Receives repository contracts and services via constructor injection
- Contains no Fastify types, no Prisma calls, no HTTP concepts
- All business workflows live here

## Fastify Organization

### Plugins

Create one file per plugin under `plugins/`. Never configure plugins inline in `server.ts`.

```
plugins/
├── cookie_plugin.ts
├── cors_plugin.ts
├── jwt_plugin.ts
├── swagger_plugin.ts
└── swagger_ui_plugin.ts
```

Register all plugins through a centralized bootstrap call in `server.ts`. Plugin order matters — register auth plugins before route plugins.

### Routes

Routes must be thin. A route handler's only job is:

1. Parse and validate the request using a Zod schema
2. Call the appropriate use case
3. Return the response

Routes must not contain:

- Business logic
- Direct Prisma or database calls
- Inline schema definitions (import from `schemas/`)
- Conditional branching based on business rules

Every route file must export Swagger documentation via the route schema.

## Schemas

All request and response schemas live in `schemas/`. Routes import schemas; they never declare them inline.

```
schemas/
├── create_user_schema.ts
├── login_schema.ts
└── update_user_schema.ts
```

Rules:

- Use Zod exclusively — no `joi`, no `yup`, no manual validation
- Export the inferred TypeScript type alongside the schema
- Reuse schemas across routes wherever the shape is identical
- Keep schemas focused: one file per domain operation

Example pattern:

```ts
import { z } from 'zod'

export const create_user_schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export type CreateUserInput = z.infer<typeof create_user_schema>
```

## Database

Use Prisma as the ORM and PostgreSQL as the database.

### Access Rules

- Routes must never import the Prisma client
- Use cases must never import the Prisma client
- Only repository implementations (in `db/`) may use Prisma

### Request Flow

```
Route
  ↓
Use Case
  ↓
Repository Contract (core/repositories)
  ↓
Repository Implementation (db/)
  ↓
Prisma
  ↓
PostgreSQL
```

Violating this flow breaks the dependency inversion principle and makes the domain untestable without a real database.

## Validation

Use Zod for all validation:

- HTTP request bodies, params, and query strings
- HTTP response shapes
- Environment variables (validate on startup; fail fast on missing vars)
- DTO types passed between layers

Do not write manual `if (!value)` validation logic. If Zod cannot express the constraint cleanly, write a domain error in `core/errors` and throw it from the entity or use case.

## Testing

Use Vitest. Tests are mandatory.

### What to test

| Layer | Required |
|---|---|
| Entities | Yes |
| Use cases | Yes |
| Routes | Yes |

Every new feature must ship with tests. PRs without tests for new behavior will be rejected.

### File naming

Use `.spec.ts` suffix, co-located with the source file:

```
core/
  entities/
    user.ts
    user.spec.ts
  usecases/
    create_user_use_case.ts
    create_user_use_case.spec.ts

routes/
  users_routes.ts
  users_routes.spec.ts
```

### Testing guidelines

- Test entities without any framework dependency
- Test use cases by injecting in-memory repository implementations
- Test routes using Fastify's `inject` method — do not start a real server
- Do not mock the Prisma client in route tests; use repository interfaces with in-memory fakes instead

## AI Agent Rules

When generating or modifying code in this package, follow these rules without exception:

1. Read and follow the root monorepo `CLAUDE.md` before taking any action.
2. Never install a dependency without first verifying the monorepo rules on where it belongs.
3. Follow Clean Architecture strictly — dependencies point inward only.
4. Follow SOLID principles in every class and function.
5. Use snake_case for every file name, folder name, variable, function, and identifier.
6. Keep routes thin — no business logic, no database access, no inline schemas.
7. Keep all business logic inside use cases in `core/usecases`.
8. Keep entities in `core/entities` free of any framework or ORM imports.
9. Keep all Zod schemas inside the `schemas/` directory; never declare them inline in route files.
10. Use Zod for all validation — requests, responses, env vars, DTOs.
11. Create tests for every entity, use case, and route you add or modify.
12. Prefer explicit code over magic or meta-programming abstractions.
13. Avoid premature optimization; write clear, correct code first.
14. Do not create generic utility files (`helpers.ts`, `utils.ts`) without clear, documented justification.
15. Ask for explicit user approval before creating any git commit.
16. Follow Conventional Commits format for all commit messages (see root `CLAUDE.md`).
17. Scope every query, entity, and relation by `hotel_id` — never allow cross-hotel data leakage.
18. Derive `hotel_id` exclusively from the authenticated JWT payload (`request.user.hotelId`); never accept it from the request body or query params.

---

## Multi-tenant Architecture

This system is multi-tenant. Every piece of business data belongs to exactly one hotel.

### Mandatory Rules

- Every business table MUST include a `hotel_id` column.
- Every query that fetches, creates, updates, or deletes business data MUST filter or set `hotel_id`.
- `hotel_id` is NEVER trusted from the client. It is derived from the authenticated user's JWT payload.
- Repository implementations that accept a `hotel_id` parameter receive it from the use case, which receives it from the route, which reads it from `request.user.hotelId`.
- Cross-hotel data access is a critical security vulnerability. Treat it as such.

### Pattern

```ts
// Route handler
const { hotelId } = request.user

// Use case receives it as a parameter
await useCase.execute({ hotelId, ...body })

// Repository applies it to every query
await db.reservation.findMany({ where: { hotel_id: hotelId } })
```

---

## Database Rules

- **ORM**: Prisma only. No raw SQL unless Prisma cannot express the query.
- **Field names**: All schema fields MUST be written in Portuguese (pt-BR) with snake_case.
- **Primary keys**: UUID using `@default(uuid())` on all models.
- **Timestamps**: Every model must have `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`.
- **Indexes**: All foreign key columns and frequently queried columns MUST have `@@index`.
- **Cascades**: Use `onDelete: Cascade` on foreign key relations where child records should be removed with the parent.
- **Datasource URL**: Set via `env("DATABASE_URL")` in the schema's `datasource db` block. The runtime adapter (`@prisma/adapter-pg`) overrides this for query execution; the env var is still required for `prisma migrate`.
- **Table names**: Use `@@map("nome_em_portugues")` to map PascalCase model names to Portuguese table names.
