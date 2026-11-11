---
paths:
  - "packages/api/**"
---

# Back-end Standards (Fastify services)

Shared rules for every API-type package. Add the new package's glob to `paths`
above when creating another service. Package-specific facts live in each
package's `CLAUDE.md`. Paths below are relative to the package's `src/`.

## Stack

Fastify (+ cookie, cors, jwt, rate-limit, swagger) · `fastify-type-provider-zod`
· Zod · Prisma + `@prisma/adapter-pg` (PostgreSQL) · tsx · Vitest.

## Architecture

Clean Architecture + SOLID:

- **Dependencies point inward**: entities and use cases never import Fastify,
  Prisma, pg or any I/O library.
- **Dependency inversion**: use cases depend on repository interfaces in
  `core/repositories/`, never on concrete implementations.
- **Framework independence**: business rules must be testable without booting
  Fastify or touching a database.

## Structure

```text
src/
├── core/
│   ├── entities/        # Domain entities + invariants (+ .spec.ts)
│   ├── errors/          # Domain/application error classes
│   ├── repositories/<domain>/
│   │   ├── <domain>.repository.ts   # Interface contract
│   │   ├── implementation/          # Prisma implementation
│   │   └── in-memory/               # In-memory fake (tests only)
│   ├── services/        # Domain services
│   ├── usecases/<domain>/   # One use case per file (+ .spec.ts)
│   └── utils/
├── config/              # Env loading and validation
├── db/                  # Seeds and bootstrap
├── lib/                 # External wrappers (prisma singleton)
├── plugins/             # Fastify plugins (one file each)
├── prisma/              # schema.prisma + migrations
├── routes/<domain>/     # Route plugins (+ <domain>_routes.spec.ts)
├── schemas/<domain>/    # Zod request/response schemas
├── types/               # Shared TS types (FastifyTypedInstance)
└── server.ts            # Entry point
```

## Layers

- **Entities**: validate invariants on instantiation and throw errors from
  `core/errors/`.
- **Errors**: explicit classes (`ResourceNotFoundError`, `ConflictError`).
  Never `throw new Error('...')` generically.
- **Repositories**: each domain has the interface, a Prisma implementation and
  an in-memory fake. `core/repositories/index.ts` re-exports implementations
  under standard aliases.
- **Use cases**: one per file, a single public `execute`, dependencies injected
  through the constructor, zero HTTP/framework concepts.

## Fastify

- **Plugins**: one file per plugin (`jwt_plugin.ts`, `cors_plugin.ts`). They
  handle framework integration only and never instantiate domain objects, use
  cases or repositories. `fastify-routes.ts` only registers route plugins.
- **Routes stay thin**: validate with Zod, call the use case, format the reply.
- **Composition root**: each route plugin instantiates its repositories and use
  cases at the top of the route function.
- **Types**: route functions receive `app: FastifyTypedInstance` from
  `@/types`, never raw `FastifyInstance`.
- **Exports**: named function exports (`export async function users_routes`).
- **Auth**: `app.authenticate` as `onRequest` on protected routes (single
  source of truth for JWT validation).

```ts
export async function users_routes(app: FastifyTypedInstance) {
  const user_repository = new PostgresUserRepository(prisma)
  const create_user_use_case = new CreateUserUseCase(user_repository)

  app.post('/users', {
    onRequest: [app.authenticate],
    schema: create_user_schema,
  }, async (request, reply) => {
    const result = await create_user_use_case.execute(request.body)
    return reply.status(201).send(result)
  })
}
```

## Database (Prisma & PostgreSQL)

- Prisma only; raw SQL only when Prisma cannot express the query.
- Fields: Portuguese (pt-BR) `snake_case`. Models: PascalCase mapped with
  `@@map("tabela_em_portugues")`.
- Primary keys: UUID strings (`@default(uuid())`).
- Every model has `created_at DateTime @default(now())` and
  `updated_at DateTime @updatedAt`.
- `@@index` on every foreign key and search column.
- **Deletion**: deleting a resource with active dependents returns **HTTP 409**
  with an explanation. Never delete silently.

## Pagination

List endpoints follow the root pagination contract. Repository types
(`PaginationInput`, `PaginationMeta`, `PaginatedResult`) live in
`core/repositories/pagination.ts`.

## Schemas

Zod only, in `schemas/<domain>/`, one file per domain operation
(`create_user_schema.ts`). Export both the schema and its inferred type.

## Testing

Vitest. TDD, tests first. Specs sit next to the file under test. Only
**entities, use cases and routes** are tested; services, utils and schemas
do not need dedicated specs (schemas are exercised through route tests).

| Target | Spec | Rules |
|---|---|---|
| Entities | `core/entities/<entity>.spec.ts` | Pure TS, invariants only |
| Use cases | `core/usecases/<domain>/<use_case>.spec.ts` | In-memory repositories, never mock Prisma |
| Routes | `routes/<domain>/<domain>_routes.spec.ts` | `app.inject()`: routing, auth hooks, schema validation |

Run only the specs for the current task (`pnpm exec vitest run <path>`), never
the whole suite and never in watch mode. Use the `qa-tester` agent for test work.
