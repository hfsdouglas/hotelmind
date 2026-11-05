---
name: api-development
description: >-
  Use this skill when developing, refactoring, or extending backend features in
  packages/api, including use cases, entities, repositories, Fastify routes, and
  Zod schemas following Clean Architecture and TDD.
---

# API Development Procedure

Step-by-step workflow for developing backend features in `packages/api`.

## Prerequisites & Rules

- Read `.agents/rules/architecture.md`, `.agents/rules/database.md`, and `.agents/rules/multi-tenancy.md`.
- Strict TDD (Red -> Green -> Refactor): Never write production code before its failing test.
- Every business operation must enforce tenant scoping using `hotel_id` from `request.user.hotelId`.

## Step-by-Step Workflow

### 1. Shared Types & Contracts
If the feature exposes or shares data with front-end packages:
- Define or update the TypeScript interfaces in `packages/.contracts/src/<domain>/`.
- Export the types from `packages/.contracts/src/index.ts`.
- Run contract build/check if necessary.

### 2. Domain Entities & Invariants (TDD)
- Create or update `src/core/entities/<domain>/<entity>.spec.ts`.
- Define expected domain invariants and validation errors.
- Implement the entity in `src/core/entities/<domain>/<entity>.entity.ts`.
- Ensure zero framework dependencies (no Fastify, Prisma, or pg imports).

### 3. Repository Contract & In-Memory Fake
- Define the repository interface in `src/core/repositories/<domain>/<domain>.repository.ts`.
- Update the in-memory fake in `src/core/repositories/<domain>/in-memory/in_memory_<domain>_repository.ts`.
- Ensure the fake handles `hotel_id` filtering, pagination, and sorting faithfully.

### 4. Application Use Case (TDD)
- Write the failing unit test in `src/core/usecases/<domain>/<use_case_name>.spec.ts`.
- Inject the in-memory repository fake and any mock domain services into the usecase.
- Implement the use case in `src/core/usecases/<domain>/<use_case_name>.ts` with a single public `execute` method.
- Verify tests pass: `pnpm --filter api test <use_case_name>.spec.ts`.

### 5. Production Repository Implementation (Prisma)
- Implement or update the Prisma repository in `src/core/repositories/<domain>/implementation/postgres_<domain>_repository.ts`.
- Ensure all queries apply `{ where: { hotel_id: hotelId } }`.
- Register/re-export the implementation in `src/core/repositories/index.ts`.

### 6. Validation Schemas (Zod)
- Create the schema file in `src/schemas/<operation>_schema.ts`.
- Define input parameters, query strings, and response shapes using Zod.
- Export inferred types: `export type <Operation>Input = z.infer<typeof <operation>_schema>`.

### 7. Route Plugin & Composition Root (TDD)
- Write the route integration test in `src/routes/<domain>/<domain>_routes.spec.ts` using `app.inject()`.
- Implement route definitions in `src/routes/<domain>/<domain>_routes.ts`.
- Instantiate use cases and repositories directly inside the route function (composition root).
- Wire `onRequest: [app.authenticate]` for protected routes.
- Extract `const { hotelId } = request.user` and forward to the usecase.
- Register routes in `src/routes/fastify-routes.ts` if adding a new domain.

### 8. Verification & Quality Gate
- Run tests: `pnpm --filter api test`.
- Run Biome check: `pnpm exec biome check packages/api`.
