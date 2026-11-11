# API Package

Fastify HTTP server for HotelMind.

## Stack

Fastify (+ cookie, cors, jwt, rate-limit, swagger) · `fastify-type-provider-zod`
· Zod · Prisma + `@prisma/adapter-pg` (PostgreSQL) · tsx · Vitest.

---

## Architecture Principles

This service strictly adheres to **Clean Architecture** and **SOLID**:

- **Dependencies Point Inward**: Domain entities and use cases are isolated at the core; they never import external infrastructure (Prisma, Fastify, pg).
- **Dependency Inversion**: High-level modules (use cases) depend on abstractions (repository interfaces in `core/repositories/`), not concrete database implementations.
- **Framework Independence**: All business workflows and validation rules must be unit-testable without booting Fastify or connecting to a physical database.

---

## Project Structure

```text
src/
├── core/
│   ├── entities/         # Domain entities, business invariants, and entity unit tests (.spec.ts)
│   ├── errors/           # Custom domain and application error classes
│   ├── repositories/     # Repository contracts, implementations, and in-memory test fakes
│   │   ├── index.ts      # Re-exports concrete implementations under standard aliases
│   │   └── <domain>/
│   │       ├── <domain>.repository.ts   # Repository interface contract
│   │       ├── implementation/          # Prisma production implementation
│   │       └── in-memory/               # In-memory fake implementation for tests
│   ├── services/         # Domain service contracts (e.g., password hashing)
│   └── usecases/         # Application use cases and business workflows (.spec.ts + .ts)
│
├── config/               # Environment variables loader and validation
├── db/                   # Seed scripts and database bootstrap
├── prisma/
│   ├── migrations/       # Database migration history
│   └── schema.prisma     # Prisma schema definition
├── lib/                  # Shared external wrappers (e.g., prisma singleton)
├── plugins/              # Fastify plugins (CORS, JWT, cookies, Swagger)
├── routes/               # HTTP route plugins, handlers, and integration tests
├── schemas/              # Zod validation schemas for requests and responses
├── types/                # Project TypeScript types (e.g., FastifyTypedInstance)
└── server.ts             # Application entry point
```

---

## Layer Responsibilities

### `core/entities`
Domain entities and business invariants.
- Must not import Fastify, Prisma, or I/O libraries.
- Validate invariant business constraints upon instantiation; throw domain errors from `core/errors/`.

### `core/errors`
Specific domain and application error classes.
- Create explicit error classes (e.g. `ResourceNotFoundError`, `ConflictError`).
- Never throw generic `Error('something went wrong')`.

### `core/repositories`
Organized by domain folder (`core/repositories/<domain>/`):
1. `<domain>.repository.ts`: Interface contract defining required queries and mutations.
2. `implementation/`: Production class backed by Prisma.
3. `in-memory/`: In-memory fake class maintaining state in memory, used exclusively in tests.

### `core/usecases`
Orchestration of application use cases.
- Exactly one use case per file, exposing a single public `execute` method.
- Dependencies (repositories and services) injected via constructor.
- Zero HTTP or framework concepts.

---

## Fastify Organization

### Plugins
Create one file per plugin under `plugins/` (e.g. `jwt_plugin.ts`, `cors_plugin.ts`).
- Plugins handle framework integration only. They MUST NOT instantiate domain objects, use cases, or repositories.
- `fastify-routes.ts` registers route plugins and nothing else.

### Route Plugins & Composition Roots
Routes must remain thin. A route handler only validates the request via Zod, calls the usecase, and formats the reply.
- **Dependency Composition Root**: Each route plugin file is the composition root for its dependencies. Repositories and use cases are instantiated at the top of the route function.
- **FastifyTypedInstance**: Route functions must always receive `app: FastifyTypedInstance` from `@/types` (never raw `FastifyInstance`).
- **Named Exports**: Always use named function exports (`export async function users_routes(app: FastifyTypedInstance)`).
- **Authentication Hook**: Use `app.authenticate` as the `onRequest` hook on protected routes. Single source of truth for JWT validation.

```ts
export async function users_routes(app: FastifyTypedInstance) {
  const user_repository = new PostgresUserRepository(prisma)
  const create_user_use_case = new CreateUserUseCase(user_repository)

  app.post('/users', {
    onRequest: [app.authenticate],
    schema: create_user_schema
  }, async (request, reply) => {
    const { hotelId } = request.user
    const result = await create_user_use_case.execute({ hotelId, ...request.body })
    return reply.status(201).send(result)
  })
}
```

---

## Multi-Tenancy (`hotel_id`)

1. **Mandatory `hotel_id`**: Every business database table and model MUST include a `hotel_id` column.
2. **Untrusted Client Inputs**: `hotel_id` is NEVER accepted from the client request body or query params.
3. **Derivation from JWT**: `hotel_id` is exclusively derived from the authenticated JWT token (`request.user.hotelId`).
4. **Scoping**: Every query that fetches, creates, updates, or deletes business records MUST filter or set `hotel_id`.

---

## Database Standards (Prisma & PostgreSQL)

- **ORM**: Prisma only. No raw SQL unless Prisma cannot express the query.
- **Field Names**: All schema fields MUST be written in Portuguese (`pt-BR`) using `snake_case`.
- **Table Names**: PascalCase model names mapped to Portuguese table names via `@@map("tabela_em_portugues")`.
- **Primary Keys**: UUID strings with `@default(uuid())`.
- **Timestamps**: Every model must define `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`.
- **Indexes**: All foreign keys (especially `hotel_id`) and search columns MUST have `@@index`.
- **Deletion Policy & HTTP 409**: When a DELETE operation targets a resource with active dependent records, return **HTTP 409 Conflict** with an informative explanation. Never delete silently.
- **`grupos_ids` Pattern**: The `User` model stores access group IDs as a comma-separated string in `grupos_ids` (`String? @db.Text`) without a pivot table. Membership queries must check `WHERE grupos_ids = id OR grupos_ids LIKE '<id>,%' OR grupos_ids LIKE '%,<id>' OR grupos_ids LIKE '%,<id>,%'`.

---

## Pagination

List endpoints implement the root pagination contract. Repository types
(`PaginationInput`, `PaginationMeta`, `PaginatedResult`) live in
`core/repositories/pagination.ts`.

---

## Schemas & Validation

- All request, response, and query schemas reside in `src/schemas/`.
- Use Zod exclusively.
- Export both the Zod schema and its inferred TypeScript type.
- Keep schemas focused: one file per domain operation (e.g. `create_user_schema.ts`).

---

## Testing

- **Entity Tests** (`core/entities/<domain>/<entity>.spec.ts`): Test domain invariants and validations in pure TypeScript.
- **Use Case Tests** (`core/usecases/<domain>/<use_case>.spec.ts`): Inject in-memory repository fakes. Never mock Prisma directly.
- **Route Tests** (`routes/<domain>/<domain>_routes.spec.ts`): Use Fastify's `app.inject()` method to test HTTP routing, authentication hooks, and schema validation.
