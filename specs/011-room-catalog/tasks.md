---

description: "Task list for room categories and room creation"

---

# Tasks: Cadastro de Categorias e Quartos

**Input**: Design documents from `/specs/011-room-catalog/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Organization**: Tasks are grouped by user story to enable independently testable increments. Tests are included because the implementation plan requires unit, route and UI coverage.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the feature's shared files and routing entry points.

- [X] T001 [P] Create the feature source directories under `packages/.contracts/src`, `packages/api/src/core`, `packages/api/src/routes`, `packages/api/src/schemas`, and `packages/web/src/pages/app`
- [X] T002 [P] Add the feature exports to `packages/.contracts/src/index.ts` after creating the category and room contract modules
- [X] T003 Register `categorias_quartos_routes` and `quartos_routes` in `packages/api/src/plugins/fastify_routes.ts` with no business logic in the registration module
- [X] T004 [P] Add protected web route entries for `/categorias_quartos`, `/categorias_quartos/novo`, `/quartos`, and `/quartos/novo` in `packages/web/src/routes.tsx`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared contracts, persistence relationships, and test seams before story implementation.

**⚠️ CRITICAL**: Complete this phase before implementing user stories.

- [X] T005 [P] Define `CategoriaQuarto`, category list metadata, and category create payload types in `packages/.contracts/src/categorias_quartos.ts` according to `specs/011-room-catalog/contracts/categorias_quartos.md`
- [X] T006 [P] Define `ConfiguracaoCama`, `Quarto`, room list metadata, and room create payload types in `packages/.contracts/src/quartos.ts` according to `specs/011-room-catalog/contracts/quartos.md`
- [X] T007 Add `CategoriaQuarto`, `Quarto`, and `ConfiguracaoCama` models, hotel relations, tenant indexes, and per-hotel uniqueness constraints to `packages/api/src/prisma/schema.prisma`
- [X] T008 Create the Prisma migration for the room catalog in `packages/api/src/prisma/migrations/<timestamp>_add_room_catalog/migration.sql`, including foreign keys and rollback-safe cascade behavior for owned bed configurations
- [X] T009 [P] Reuse the existing pagination abstraction from `packages/api/src/core/repositories/pagination.ts` for category and room repository inputs without duplicating it
- [X] T010 Add the initial controlled bed-type values and their public type in `packages/.contracts/src/quartos.ts`, ensuring the API schema and web select use the same values
- [X] T011 Add feature-level error mapping conventions for duplicate category, duplicate room identification, missing/inactive category, and invalid room configuration in `packages/api/src/core/errors/categoria_quarto_errors.ts` and `packages/api/src/core/errors/quarto_errors.ts`

**Checkpoint**: Contracts, database model, migration, shared validation values, and error categories are ready for story work.

## Phase 3: User Story 1 - Criar categoria de quarto (Priority: P1) 🎯 MVP

**Goal**: Let an authorized hotel user list and create room categories with validation and duplicate protection.

**Independent Test**: With an authenticated hotel user, create a valid category through the category form or `POST /categorias_quartos`, then confirm it appears in `GET /categorias_quartos`; repeat with an empty or duplicate name and confirm rejection.

### Tests for User Story 1

- [X] T012 [P] [US1] Add valid/invalid category entity invariant tests in `packages/api/src/core/entities/categoria_quarto.spec.ts`
- [X] T013 [P] [US1] Add category schema tests for required name, trimming, status, and invalid payloads in `packages/api/src/schemas/categorias_quartos/categorias_quartos_schema.spec.ts`
- [X] T014 [P] [US1] Add category use-case tests for creation, duplicate conflict, hotel scoping, and listing in `packages/api/src/core/usecases/categorias_quartos/categoria_quarto_use_cases.spec.ts`
- [ ] T015 [P] [US1] Add HTTP injection tests for protected category list/create/get routes, `400`, `401`, `404`, and `409` responses in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.spec.ts`
- [ ] T016 [P] [US1] Add web tests for category list empty state, create form validation, success navigation, and duplicate error feedback in `packages/web/src/pages/app/categorias_quartos/novo.spec.tsx` and `packages/web/src/pages/app/categorias_quartos/index.spec.tsx`

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement the `CategoriaQuarto` domain entity and normalized-name invariant in `packages/api/src/core/entities/categoria_quarto.ts`
- [X] T018 [P] [US1] Define the category repository interface and Prisma/in-memory implementations in `packages/api/src/core/repositories/categorias_quartos/categoria_quarto.repository.ts`, `packages/api/src/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository.ts`, and `packages/api/src/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository.ts`
- [X] T019 [US1] Implement category create and list use cases with hotel scoping and unique-conflict translation in `packages/api/src/core/usecases/categorias_quartos/criar_categoria_quarto_use_case.ts` and `packages/api/src/core/usecases/categorias_quartos/listar_categorias_quarto_use_case.ts`
- [X] T020 [US1] Define category request, response, query, and error schemas in `packages/api/src/schemas/categorias_quartos/categorias_quartos_schema.ts`
- [X] T021 [US1] Implement authenticated `GET /categorias_quartos`, `POST /categorias_quartos`, and `GET /categorias_quartos/:id` handlers in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.ts`
- [X] T022 [P] [US1] Implement category API calls and typed payloads in `packages/web/src/api/categorias_quartos.service.ts`
- [X] T023 [US1] Implement the category list layout with empty/loading/error states and create action in `packages/web/src/pages/app/categorias_quartos/index.tsx`
- [X] T024 [US1] Implement the category creation layout with required-name validation, status handling, cancellation, success toast, and conflict feedback in `packages/web/src/pages/app/categorias_quartos/novo.tsx`

**Checkpoint**: User Story 1 is independently usable as the MVP.

## Phase 4: User Story 2 - Criar quarto dentro de uma categoria (Priority: P1)

**Goal**: Let an authorized user list rooms by category and create a uniquely identified room under an active category.

**Independent Test**: With a category from US1, submit a valid room payload and confirm the room is listed under that category; with no categories, confirm the UI directs the user to category creation; duplicate room identification is rejected.

### Tests for User Story 2

- [X] T025 [P] [US2] Add room entity tests for non-empty identification, hotel scoping, and positive capacity in `packages/api/src/core/entities/quarto.spec.ts`
- [X] T026 [P] [US2] Add room schema tests for category, identification, capacity, and minimum bed collection shape in `packages/api/src/schemas/quartos/quartos_schema.spec.ts`
- [ ] T027 [P] [US2] Add room use-case tests for active same-hotel category, duplicate identification, not-found category, and atomic create intent in `packages/api/src/core/usecases/quartos/quarto_use_cases.spec.ts`
- [ ] T028 [P] [US2] Add HTTP injection tests for room list/create/get, category filtering, unauthorized access, missing category, inactive category, and duplicate identification in `packages/api/src/routes/quartos/quartos_routes.spec.ts`
- [ ] T029 [P] [US2] Add web tests for room list grouping/filtering, no-category guidance, cancellation, successful creation, and conflict feedback in `packages/web/src/pages/app/quartos/index.spec.tsx` and `packages/web/src/pages/app/quartos/novo.spec.tsx`

### Implementation for User Story 2

- [X] T030 [P] [US2] Implement the `Quarto` domain entity and identification/capacity invariants in `packages/api/src/core/entities/quarto.ts`
- [X] T031 [P] [US2] Define the room repository interface and Prisma implementation for scoped list, find, and atomic create operations in `packages/api/src/core/repositories/quartos/quarto.repository.ts` and `packages/api/src/core/repositories/quartos/implementation/postgres_quarto_repository.ts`
- [X] T032 [US2] Implement room create and list use cases with category validation, hotel scoping, and conflict translation in `packages/api/src/core/usecases/quartos/criar_quarto_use_case.ts` and `packages/api/src/core/usecases/quartos/listar_quartos_use_case.ts`
- [X] T033 [US2] Define room request, response, query, nested category, nested bed, and error schemas in `packages/api/src/schemas/quartos/quartos_schema.ts`
- [X] T034 [US2] Implement authenticated `GET /quartos`, `POST /quartos`, and `GET /quartos/:id` handlers in `packages/api/src/routes/quartos/quartos_routes.ts`
- [X] T035 [P] [US2] Implement room list/create/get API calls and category filter parameters in `packages/web/src/api/quartos.service.ts`
- [X] T036 [US2] Implement the room list layout with category grouping/filter, empty state, loading/error states, and create action in `packages/web/src/pages/app/quartos/index.tsx`
- [X] T037 [US2] Implement the initial room form layout with category selection, identification, capacity field, cancel action, and no-category link in `packages/web/src/pages/app/quartos/novo.tsx`

**Checkpoint**: User Stories 1 and 2 work together; room creation is scoped to active categories and the hotel.

## Phase 5: User Story 3 - Definir camas e limite de hóspedes (Priority: P1)

**Goal**: Capture one or more controlled bed configurations and a positive guest limit as part of the room creation.

**Independent Test**: In a room form, add multiple bed types and positive quantities plus a positive guest limit, save, and verify all values in the room response/list; invalid or empty bed rows and capacity are rejected.

### Tests for User Story 3

- [X] T038 [P] [US3] Add bed configuration entity tests for controlled type, positive quantity, and duplicate-type prevention in `packages/api/src/core/entities/configuracao_cama.spec.ts`
- [X] T039 [P] [US3] Extend room schema tests for zero/negative capacity, zero/negative bed quantities, missing bed type, empty beds, and duplicate bed types in `packages/api/src/schemas/quartos/quartos_schema.spec.ts`
- [ ] T040 [P] [US3] Extend room use-case tests to assert all bed rows persist together and failures leave no partial room in `packages/api/src/core/usecases/quartos/quarto_use_cases.spec.ts`
- [ ] T041 [P] [US3] Extend route tests to assert nested beds/capacity in `201` responses and user-readable `400` validation errors in `packages/api/src/routes/quartos/quartos_routes.spec.ts`
- [ ] T042 [P] [US3] Add web tests for dynamic add/remove bed rows, duplicate-type handling, positive integer validation, and rendered saved composition in `packages/web/src/pages/app/quartos/novo.spec.tsx`

### Implementation for User Story 3

- [X] T043 [P] [US3] Implement `ConfiguracaoCama`, controlled bed types, and positive-quantity invariants in `packages/api/src/core/entities/configuracao_cama.ts`
- [X] T044 [US3] Extend the room repository create/read mapping in `packages/api/src/core/repositories/quartos/implementation/postgres_quarto_repository.ts` to persist and return all bed configurations atomically
- [X] T045 [US3] Extend room create orchestration in `packages/api/src/core/usecases/quartos/criar_quarto_use_case.ts` to reject missing/duplicate bed types and preserve transaction boundaries
- [X] T046 [US3] Complete nested bed and guest-limit validation/serialization in `packages/api/src/schemas/quartos/quartos_schema.ts`
- [X] T047 [US3] Complete room route responses and validation error mapping in `packages/api/src/routes/quartos/quartos_routes.ts`
- [X] T048 [US3] Complete the room form with dynamic bed rows, controlled type select, positive quantity inputs, guest limit validation, and preserved values after save failure in `packages/web/src/pages/app/quartos/novo.tsx`
- [X] T049 [US3] Render category, guest limit, and every bed configuration in the room list in `packages/web/src/pages/app/quartos/index.tsx`

**Checkpoint**: All three user stories are independently demonstrable through the authenticated API and web application.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature and keep documentation/tooling aligned.

- [ ] T050 [P] Update API Swagger route metadata and response examples in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.ts` and `packages/api/src/routes/quartos/quartos_routes.ts`
- [ ] T051 [P] Add seed fixtures for at least one category, room, and multi-bed configuration in `packages/api/src/db/seeds/index.ts` without changing existing seed behavior
- [ ] T052 Run `pnpm --filter api db:generate` and `pnpm --filter api db:migrate` against a configured PostgreSQL database and verify the migration creates all relations
- [ ] T053 Run `pnpm --filter api test` and `pnpm --filter web test`, then fix feature regressions without weakening assertions
- [ ] T054 Run `pnpm --filter web build` and resolve type or route errors in the feature files
- [ ] T055 Execute every manual scenario in [quickstart.md](./quickstart.md), including failure/no-partial-record checks, and record any follow-up defects
- [X] T056 [P] Review changed files for snake_case naming, tenant isolation, no direct Prisma access from routes, and contract-first ordering against [constitution.md](/home/douglas/www/hotelmind/.specify/memory/constitution.md)

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; tasks T001–T004 can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; T005–T011 block story implementation.
- **User Story 1 (Phase 3)**: Depends on Phase 2; delivers the category MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and the category contract/behavior from US1 for its selectable active category.
- **User Story 3 (Phase 5)**: Depends on US2 because it completes the room create payload and UI with bed configuration.
- **Polish (Phase 6)**: Depends on all desired stories.

### User Story Dependencies

- **US1**: No dependency on another user story after Phase 2.
- **US2**: Requires the category entity and category list/create behavior from US1; room list/create is still independently testable when seeded with a category.
- **US3**: Extends the room aggregate and form from US2; it cannot be meaningfully delivered without the room flow.

### Parallel Opportunities

- T001, T002, and T004 can run in parallel; T003 follows route module creation.
- T005, T006, T009, T010, and T011 can run in parallel; T007/T008 depend on the model decisions and T005/T006.
- Within US1, T012–T016 are parallel test-writing tasks; T017, T018, and T022 can be developed in parallel before their consumers.
- Within US2, T025–T029 are parallel tests; T030, T031, and T035 can be developed in parallel after contracts.
- Within US3, T038–T042 are parallel tests; T043 can proceed in parallel with web test work, while T044–T047 remain ordered in the API path.
- T050, T051, and T056 can run in parallel after implementation; T052–T055 are validation tasks.

## Parallel Example: User Story 1

```text
Task T012: Entity invariant tests in packages/api/src/core/entities/categoria_quarto.spec.ts
Task T013: Schema tests in packages/api/src/schemas/categorias_quartos/categorias_quartos_schema.spec.ts
Task T015: HTTP route tests in packages/api/src/routes/categorias_quartos/categorias_quartos_routes.spec.ts
Task T016: Web page tests in packages/web/src/pages/app/categorias_quartos/
```

## Parallel Example: User Story 2

```text
Task T025: Room entity tests in packages/api/src/core/entities/quarto.spec.ts
Task T026: Room schema tests in packages/api/src/schemas/quartos/quartos_schema.spec.ts
Task T028: HTTP route tests in packages/api/src/routes/quartos/quartos_routes.spec.ts
Task T029: Web room-flow tests in packages/web/src/pages/app/quartos/
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3, including API and category pages.
3. Run the US1 tests and verify category creation/listing independently.
4. Stop for review before adding room behavior.

### Incremental Delivery

1. Deliver US1 as the category foundation.
2. Add US2 for room identity, category association, and room listing.
3. Add US3 for multi-bed configuration and guest capacity.
4. Run the polish phase and the complete quickstart validation.

## Notes

- Every task uses the required checklist format `- [ ] [TaskID] [P?] [Story?]` and includes concrete file paths.
- `[P]` appears only where the task can work in parallel without editing an unfinished dependency.
- No commit is created by this command.
