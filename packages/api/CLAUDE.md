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

## Project Structure

```
src/
├── core/
│   ├── entities/         # Domain entities and business rules
│   ├── errors/           # Custom domain and application errors
│   ├── repositories/     # Repository contracts and implementations
│   │   ├── index.ts      # Central export — maps infrastructure implementations to domain contracts
│   │   └── users/
│   │       ├── user.repository.ts   # Repository interface (contract only)
│   │       ├── implementation/      # Production implementations (e.g. Prisma/Postgres)
│   │       └── in-memory/           # Test and development implementations

│   ├── services/         # Domain service contracts and business services
│   └── usecases/         # Application use cases and business workflows
│
├── config/               # Environment variables, application settings, and configuration loaders
├── db/
│   └── seeds/            # Database seed scripts
├── prisma/
│   ├── migrations/       # Database migration history
│   └── schema.prisma     # Prisma schema definition
│
├── lib/                  # Wrappers around third-party libraries and external SDKs
│   └── prisma.ts         # Prisma Client singleton instance
│
├── plugins/              # Fastify plugins and framework integrations
├── routes/               # HTTP route definitions and request handlers
├── schemas/              # Zod schemas for request, response, and validation contracts
├── types/                # Shared TypeScript types, interfaces, and module augmentations
│
└── server.ts             # Application entry point — creates and starts the Fastify server

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

- No implementations live here; implementations belong in `db/repositories/<domain>/implementation/`
- In-memory fakes for tests belong in `db/repositories/<domain>/in-memory/`
- Use cases depend on these interfaces, never on concrete implementations

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

Plugins are exclusively for framework integration: CORS, JWT, cookies, Swagger, auth
decorators. They MUST NOT instantiate domain objects — no use cases, no repositories,
no domain services. `fastify-routes.ts` is the only file that calls `app.register`
for routes, but it too MUST NOT create domain objects; it only delegates to route
plugins.

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

#### Dependency Composition

Each route plugin is the **composition root** for its own dependencies. Use cases,
repositories, and domain services are instantiated at the top of the route function —
never in `fastify-routes.ts`, `server.ts`, or any plugin file.

```ts
// CORRECT — route owns its own DI
export async function auth_routes(app: FastifyTypedInstance) {
  const login_use_case = new LoginUseCase(
    new UserRepository(db),
    new HotelRepository(db),
    new BcryptPasswordHasher(),
  )

  app.post('/auth/login', ..., async (request, reply) => {
    await login_use_case.execute(request.body)
  })
}

// WRONG — factory that receives a use case as argument
export function auth_routes(login_use_case: LoginUseCase) {
  return async (app: FastifyTypedInstance) => { ... }
}
```

`fastify-routes.ts` registers route plugins and nothing else:

```ts
export function setRoutes(app: FastifyTypedInstance) {
  app.register(auth_routes)   // no arguments — never pass domain objects here
}
```

Rationale: plugin and server files have no knowledge of domain intent. Only the route
knows which use case it needs and how to wire it. Passing dependencies through an
intermediary layer creates hidden coupling and makes the dependency graph non-obvious.

#### Exports

Always use named exports — never default exports:

```ts
// correct
export function users_routes(app: FastifyTypedInstance) {
  app.get('/users', ...)
}

// wrong
export default function (app: FastifyTypedInstance) { ... }
```

#### Type

Every route function receives `app: FastifyTypedInstance`. This is the project-local type that wires Fastify with the Zod type provider. Import it from `src/types/`:

```ts
import type { FastifyTypedInstance } from '@/types'
```

Never use the raw `FastifyInstance` type in route files.

#### Authentication

Use `app.authenticate` as the `onRequest` hook for protected routes. This decorator is registered by the auth plugin and is the single source of truth for JWT verification:

```ts
app.get('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
  ...
})
```

Never manually verify tokens inside route handlers.

## Repository Organization

Repositories are grouped by domain under `db/repositories/`. Each domain folder contains two sub-folders:

| Folder | Contents |
|---|---|
| `implementation/` | Prisma-backed concrete class (e.g., `postgres_hotel_repository.ts`) |
| `in-memory/` | In-memory fake used exclusively in tests (e.g., `in_memory_hotel_repository.ts`) |

The central `db/repositories/index.ts` re-exports every implementation under its domain alias so consumers never reference the concrete class name:

```ts
// db/repositories/index.ts
import { PostgresHotelRepository } from '@/core/repositories/hotel/implementations/postgres-hotel-repositoty';

export const HotelRepository = PostgresHotelRepository;
```

Rules:
- Use cases receive repository instances via constructor injection — they never instantiate them
- Tests inject the corresponding `in-memory/` fake; never mock Prisma directly

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

Use Vitest. Tests are mandatory and must pass as part of every build. 

### What to test

| Layer | Required |
|---|---|
| Entities | Yes |
| Use cases | Yes |
| Routes | Yes |

### File naming

Use `.spec.ts` suffix, co-located with the source file:

```
core/
  entities/
    user.entity.ts
    user.spec.ts
  repositories/
    user/
      user.repository.ts
  errors/
    user.errors.ts
  services/
    user.services.ts
  usecases/
    user/
      create_user_use_case.ts
      create_user_use_case.spec.ts

routes/
  users/
    create_user.ts
    list_users.ts
    update_user.ts
    delete_user.ts
```

### Testing guidelines

- Test entities without any framework dependency
- Test use cases by injecting in-memory repository implementations
- Test routes using Fastify's `inject` method — do not start a real server
- Do not mock the Prisma client in route tests; use repository interfaces with in-memory fakes instead

## AI Agent Rules

When generating or modifying code in this package, follow these rules without exception:

1. Read the root monorepo `CLAUDE.md` before taking any action.
2. Never install a dependency without verifying where it belongs per the monorepo rules.
3. Use snake_case for every file name, folder name, variable, function, and identifier.
4. Keep routes thin — no business logic, no database access, no inline schemas. Each route instantiates its own use cases internally; never receive them as function parameters.
5. Keep all Zod schemas inside `schemas/`; never declare them inline in route files.
6. Write tests alongside every entity, use case, and route you add or modify — do not defer.
7. Do not create generic utility files (`helpers.ts`, `utils.ts`) without documented justification.
8. Ask for explicit user approval before creating any git commit.
9. Scope every query, entity, and relation by `hotel_id` — never allow cross-hotel data leakage.
10. Derive `hotel_id` exclusively from the authenticated JWT payload (`request.user.hotelId`); never accept it from the request body or query params.

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

---

## Pagination Standard

All list endpoints accept the following query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| `pagina` | number | 1 | Page number (1-indexed) |
| `limite` | number | 50 | Items per page (max 250) |
| `busca` | string | — | Optional free-text search |
| `ordenar_por` | string | — | Field name to sort by |
| `direcao` | `asc` \| `desc` | `asc` | Sort direction |

All list responses include a `meta` object:

```ts
{
  data: T[],
  meta: {
    pagina: number
    limite: number
    total: number
    ultima_pagina: number
  }
}
```

---

## Conflict Deletion Policy

When a DELETE request targets a resource that has dependent records, return HTTP **409 Conflict** with a descriptive message. Never delete silently or cascade beyond what the database schema enforces.

Example: deleting a `Grupo` that has users linked via `grupos_ids` must return 409.

---

## grupos_ids Pattern

The `User` model stores group memberships as a comma-separated string in the `grupos_ids` field (`String? @db.Text`). There is no pivot table.

- Format: `"uuid1,uuid2,uuid3"`
- To check membership: query `WHERE grupos_ids = id OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%'`
- When updating groups: replace the full string; do not append/remove individual IDs in the DB layer
