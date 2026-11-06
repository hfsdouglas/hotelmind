---
name: crud-development
description: >-
  Use this skill when implementing a full-stack CRUD feature end-to-end across
  the HotelMind monorepo, connecting contracts, database, backend API, and
  frontend applications (web/admin).
---

# Full-Stack CRUD Development Procedure

Step-by-step workflow for implementing complete CRUD features across the monorepo.

## Lifecycle Phases

```text
Phase 1: Contracts → Phase 2: Database & Model → Phase 3: Backend API (TDD) → Phase 4: Frontend UI (TDD) → Phase 5: Verification
```

---

## Phase 1: Shared Contracts (`packages/.contracts`)

1. Define shared TypeScript interfaces in `packages/.contracts/src/<domain>/`.
   - Entity shapes (e.g. `CategoriaQuarto`, `Reserva`).
   - Create and Update DTOs.
   - List query filters and paginated response shapes.
2. Export all types from `packages/.contracts/src/index.ts`.
3. Do not include Zod schemas or runtime code in `.contracts`.

---

## Phase 2: Database Modeling & Migrations (`packages/api`)

1. Update `packages/api/prisma/schema.prisma`:
   - Include `hotel_id String` with `@@index([hotel_id])`.
   - Use snake_case in pt-BR for field names and `@@map` for tables.
   - Primary key UUID with `@default(uuid())`.
2. Generate migration:
   ```bash
   pnpm --filter api exec prisma migrate dev --name create_<domain>_table
   ```
3. Run `pnpm --filter api exec prisma generate`.

---

## Phase 3: Backend API Implementation (TDD)

1. **Entities & Invariants**:
   - Write unit tests in `src/core/entities/<domain>/<domain>.spec.ts`.
   - Implement entity in `src/core/entities/<domain>/<domain>.entity.ts`.
2. **Repository Contract & In-Memory Fake**:
   - Define interface in `src/core/repositories/<domain>/<domain>.repository.ts`.
   - Implement in-memory fake in `src/core/repositories/<domain>/in-memory/`.
3. **Use Cases (TDD)**:
   - Create use cases for each operation (`create`, `find_by_id`, `list`, `update`, `delete`).
   - Write unit tests injecting the in-memory fake first.
   - Implement `execute` methods enforcing `hotel_id` isolation.
   - For `delete`, verify 409 Conflict if dependent records exist.
4. **Prisma Implementation**:
   - Implement repository in `src/core/repositories/<domain>/implementation/`.
   - Export in `src/core/repositories/index.ts`.
5. **Schemas (Zod)**:
   - Create request/response schemas in `src/schemas/<domain>_schemas.ts`.
6. **Routes & Fastify Plugin**:
   - Write route tests using `app.inject()`.
   - Implement routes with `onRequest: [app.authenticate]`.
   - Instantiate use cases in the route function (composition root).

---

## Phase 4: Frontend Implementation (TDD in `web` or `admin`)

1. **Component Placement & Design System (shadcn MCP)**:
   - Use available shadcn MCP tools to inspect, search, and scaffold components and primitives before manually writing component JSX or styles.
   - Ensure all generated UI components follow established HotelMind design patterns.
   - Place all domain components under `src/components/<domain>/`.
   - NEVER create a `components/` folder inside `src/pages/**`.
2. **API & Hooks**:
   - Create TanStack Query hooks in `src/hooks/use<Domain>.ts` using the API client.
   - Invalidate query caches on mutations.
3. **List Page**:
   - Place route entrypoint at `src/pages/app/<domain>/index.tsx`.
   - Use `usePaginacao` for query params (`pagina`, `limite`, `busca`, `ordenar_por`, `direcao`).
   - Wrap table results in `SearchResultsSuspense`.
   - Table action columns must omit the header title `"Ações"` (use `header: ''`) and action buttons must always be aligned to the right and vertically centered (`className="flex items-center justify-end gap-1"`).
4. **Create / Edit Form Pages**:
   - Route entrypoints at `novo.tsx` and `[id]/editar.tsx`.
   - Build form using `CrudFormLayout` (`src/components/forms/CrudFormLayout.tsx`).
   - Use `React Hook Form` + `Zod` schemas for client validation.
   - Handle loading, success, and error feedback using `Sonner` toasts.
5. **Tests**:
   - Write page tests (`.spec.tsx`) mocking API calls with MSW.

---

## Phase 5: Verification & Quality Gate

1. Run tests across all affected packages:
   ```bash
   pnpm test
   ```
2. Run Biome formatting and linting:
   ```bash
   pnpm exec biome check .
   ```
