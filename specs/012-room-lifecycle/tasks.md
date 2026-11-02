---

description: "Task list for room and category lifecycle, search and inventory listing"

---

# Tasks: Gestão do Ciclo de Vida de Quartos e Categorias

**Input**: Design documents from `/specs/012-room-lifecycle/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Included because the specification defines API, seed, pagination, search and web acceptance scenarios.

## Phase 1: Setup

**Purpose**: Confirm the current catalog implementation and shared list primitives before extending it.

- [X] T001 Review current room/category routes, services, forms, seed and existing catalog changes against `specs/012-room-lifecycle/plan.md`
- [X] T002 [P] Inventory reusable pagination/search/filter components and their URL-state conventions in `packages/web/src/components/data-table` and `packages/web/src/hooks/usePaginacao.ts`
- [X] T003 [P] Confirm Prisma migration/client state and workspace dependencies before changing room search and seed behavior in `packages/api/src/prisma` and `package.json`

---

## Phase 2: Foundational

**Purpose**: Establish shared query contracts, database search shape and shadcn overlay primitives before story work.

**⚠️ CRITICAL**: No user story implementation should begin until this phase is complete.

- [X] T004 [P] Extend room list contract types with `pagina`, `limite`, `busca`, `categoria_id` and `status` in `packages/.contracts/src/quartos.ts`
- [X] T005 [P] Document category direct-status-select and room overlay-filter response/query behavior in `specs/012-room-lifecycle/contracts/categorias_quartos.md` and `specs/012-room-lifecycle/contracts/quartos.md`
- [X] T006 Update room list API schemas to validate positive `pagina`, `limite` restricted to exactly 25, 50, 100 or 250 with default 25, optional partial `busca`, optional `categoria_id` and optional `status` `S|N` in `packages/api/src/schemas/quartos/quartos_schema.ts`
- [X] T007 [P] Add the shadcn/Radix Popover primitive with opaque content styling in `packages/web/src/components/ui/popover.tsx`
- [X] T008 [P] Add schema tests for room pagination defaults/bounds, search text and status values in `packages/api/src/schemas/quartos/quartos_schema.spec.ts`

**Checkpoint**: Query contracts, validation and overlay UI foundation are ready.

---

## Phase 3: User Story 1 — Editar categorias e quartos (Priority: P1) 🎯 MVP

**Goal**: Allow an authenticated hotel administrator to edit categories and all room fields without changing hotel ownership.

**Independent Test**: Edit a category and a room, including room description, numeric identification, capacity, beds and category, reload both resources and confirm the complete update persisted; attempt another hotel’s IDs and confirm no mutation.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add category update tests for valid edits, duplicate names, same-record names and tenant-scoped not-found behavior in `packages/api/src/core/usecases/categorias_quartos/categoria_quarto_use_cases.spec.ts`
- [ ] T010 [P] [US1] Add room update tests for nullable `descricao`, numeric `identificacao`, positive `limite_hospedes`, bed types/quantities and tenant scope in `packages/api/src/core/usecases/quartos/quarto_use_cases.spec.ts`
- [ ] T011 [P] [US1] Add HTTP injection tests for category and room `PUT` contracts in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.spec.ts` and `packages/api/src/routes/quartos/quartos_routes.spec.ts`

### Implementation for User Story 1

- [X] T012 [P] [US1] Add category update repository methods preserving unique `nome` per `hotel_id` in `packages/api/src/core/repositories/categorias_quartos/categoria_quarto.repository.ts` and implementations
- [X] T013 [P] [US1] Add room update repository methods preserving `identificacao` unique per `hotel_id` and replacing beds transactionally in `packages/api/src/core/repositories/quartos/quarto.repository.ts` and its Postgres implementation
- [X] T014 [P] [US1] Extend category update schema and conflict/not-found mapping in `packages/api/src/schemas/categorias_quartos/categorias_quartos_schema.ts` and `packages/api/src/core/errors/categoria_quarto_errors.ts`
- [X] T015 [P] [US1] Extend room create/update schema so `identificacao` matches `^\\d+$`, `descricao` is nullable/optional, `limite_hospedes` is a positive integer and each bed type is unique in `packages/api/src/schemas/quartos/quartos_schema.ts`
- [X] T016 [US1] Implement category update orchestration with tenant-scoped lookup and conflict handling in `packages/api/src/core/usecases/categorias_quartos/atualizar_categoria_quarto_use_case.ts`
- [X] T017 [US1] Implement room update orchestration allowing the current category to remain linked while requiring an active category for category changes in `packages/api/src/core/usecases/quartos/atualizar_quarto_use_case.ts`
- [X] T018 [US1] Register authenticated `PUT /categorias_quartos/:id` and `PUT /quartos/:id` routes without adding delete endpoints in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.ts` and `packages/api/src/routes/quartos/quartos_routes.ts`
- [X] T019 [US1] Add typed update/list methods and query parameters to `packages/web/src/api/categorias_quartos.service.ts` and `packages/web/src/api/quartos.service.ts`
- [X] T020 [P] [US1] Implement the category edit form with current values, validation and save mutation in `packages/web/src/pages/app/categorias_quartos/[id]/editar.tsx`
- [X] T021 [P] [US1] Implement the room edit form with shadcn `Textarea`, numeric identification validation, capacity and bed editing in `packages/web/src/pages/app/quartos/[id]/editar.tsx`
- [X] T022 [US1] Register category/room edit routes and add edit links to both lists in `packages/web/src/routes.tsx`, `packages/web/src/pages/app/categorias_quartos/index.tsx` and `packages/web/src/pages/app/quartos/index.tsx`

**Checkpoint**: Category and room editing works independently and remains tenant-scoped.

---

## Phase 4: User Story 2 — Inativar sem excluir (Priority: P1)

**Goal**: Preserve categories, rooms, beds and relationships while allowing reversible inactivation.

**Independent Test**: Inactivate a category and a room, reload them through the inactive filter, verify their data and relationships remain intact, and verify no delete action or endpoint exists.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add status-transition tests proving `S` to `N` preserves category rooms, room beds and room description in `packages/api/src/core/usecases/categorias_quartos/categoria_quarto_use_cases.spec.ts` and `packages/api/src/core/usecases/quartos/quarto_use_cases.spec.ts`
- [ ] T024 [P] [US2] Add route tests proving no `DELETE` operation is available and inactive categories cannot be selected for new rooms in `packages/api/src/routes/categorias_quartos/categorias_quartos_routes.spec.ts` and `packages/api/src/routes/quartos/quartos_routes.spec.ts`

### Implementation for User Story 2

- [X] T025 [US2] Preserve category status transitions without cascading to rooms in `packages/api/src/core/usecases/categorias_quartos/atualizar_categoria_quarto_use_case.ts` and `packages/api/src/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository.ts`
- [X] T026 [US2] Preserve room status transitions without deleting beds, description or category in `packages/api/src/core/usecases/quartos/atualizar_quarto_use_case.ts` and `packages/api/src/core/repositories/quartos/implementation/postgres_quarto_repository.ts`
- [X] T027 [US2] Keep new-room category queries active-only while allowing the room edit flow to retain its existing inactive category in `packages/api/src/core/usecases/categorias_quartos/listar_categorias_quarto_use_case.ts` and `packages/web/src/pages/app/quartos/[id]/editar.tsx`
- [X] T028 [US2] Add shadcn `AlertDialog` confirmation before category inactivation and report success/error through the existing toast flow in `packages/web/src/pages/app/categorias_quartos/[id]/editar.tsx`
- [X] T029 [US2] Add shadcn `AlertDialog` confirmation before room inactivation and report success/error through the existing toast flow in `packages/web/src/pages/app/quartos/[id]/editar.tsx`
- [X] T030 [US2] Render status badges and ensure category/room tables expose edit/inactivate affordances but no delete action in `packages/web/src/pages/app/categorias_quartos/index.tsx` and `packages/web/src/pages/app/quartos/index.tsx`

**Checkpoint**: Inactivation is reversible and non-destructive.

---

## Phase 5: User Story 3 — Pesquisar e paginar o inventário (Priority: P1)

**Goal**: Provide room pagination, selectable page limit, combined text search and correctly positioned status/category filters.

**Independent Test**: Search by room identification, category name and bed type; change limit and page; confirm all query selections persist. Open room “Mais filtros” and confirm it overlays content without changing table structure. On categories, use the direct status select and confirm no filter panel appears.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add repository tests for tenant-scoped partial case-insensitive `OR` search across identification, related category name and related bed type in `packages/api/src/core/repositories/quartos/implementation/postgres_quarto_repository.spec.ts`
- [ ] T032 [P] [US3] Add list/use-case tests for `pagina`, `limite`, combined search/category/status predicates and pagination metadata in `packages/api/src/core/usecases/quartos/listar_quartos_use_case.spec.ts`
- [ ] T033 [P] [US3] Add web tests for room search, visible `Pesquisar` label with search icon, limit/page state, outside-click overlay dismissal, icon-only right-aligned action and category direct status select in `packages/web/src/pages/app/quartos/index.spec.tsx` and `packages/web/src/pages/app/categorias_quartos/index.spec.tsx`

### Implementation for User Story 3

- [X] T034 [US3] Implement Prisma room search with `OR` predicates for `identificacao`, `categoria.nome` and `camas.tipo`, while applying `hotel_id`, `categoria_id`, `status`, `skip` and `take` in `packages/api/src/core/repositories/quartos/implementation/postgres_quarto_repository.ts`
- [X] T035 [US3] Propagate `busca`, `pagina` and `limite` through room list use case, route schema and response metadata in `packages/api/src/core/usecases/quartos/listar_quartos_use_case.ts`, `packages/api/src/routes/quartos/quartos_routes.ts` and `packages/api/src/schemas/quartos/quartos_schema.ts`
- [X] T036 [US3] Replace the room page’s fixed `limite: 250` query with `usePaginacao`, `SearchBar`, `DataTablePagination` and `ResultCount`, preserving `pagina`, `limite`, `busca`, `categoria_id` and `status` in `packages/web/src/pages/app/quartos/index.tsx`
- [X] T037 [US3] Replace the in-flow room `FilterPanel` card with shadcn `Popover`, keeping status and category filters overlaid without reserving page space in `packages/web/src/pages/app/quartos/index.tsx` and `packages/web/src/components/ui/popover.tsx`
- [X] T038 [US3] Replace the category `FilterPanel` status control with a direct shadcn `Select`, preserving `Todos`, `Ativos` and `Inativos` in `packages/web/src/pages/app/categorias_quartos/index.tsx`
- [X] T039 [US3] Add an icon-only edit button with accessible label/tooltip in a right-aligned actions column for both tables in `packages/web/src/pages/app/quartos/index.tsx` and `packages/web/src/pages/app/categorias_quartos/index.tsx`
- [X] T040 [US3] Ensure empty search results, page changes and limit changes preserve table structure and query state in `packages/web/src/components/data-table/data_table.tsx`, `packages/web/src/components/data-table/data_table_pagination.tsx` and `packages/web/src/hooks/usePaginacao.ts`
- [X] T041 [US3] Render the room-list search action with the visible label `Pesquisar` and the search icon, preserving its accessible name in `packages/web/src/pages/app/quartos/index.tsx` and the shared search control if applicable

**Checkpoint**: Room search/pagination and both filter presentations work independently.

---

## Phase 6: User Story 4 — Popular o inventário inicial (Priority: P2)

**Goal**: Seed exactly four suite categories and 38 rooms with varied configurations and correct category relationships.

**Independent Test**: Run the seed, verify 4 categories and 38 rooms, verify all requested ranges, verify each room has beds/capacity and verify category relation counts are 16/16/5/1. Re-run the reset-based seed and confirm no duplicates.

### Tests for User Story 4

- [ ] T042 [P] [US4] Add deterministic seed assertions for category names, room ranges, relation counts, unique identifiers, beds and positive capacities in `packages/api/src/db/seeds/index.spec.ts`

### Implementation for User Story 4

- [X] T043 [US4] Extend seed cleanup to remove `quartos_camas`, `quartos` and `categorias_quartos` before hotel deletion in `packages/api/src/db/seeds/index.ts`
- [X] T044 [US4] Create the four active categories and retain their returned IDs in `packages/api/src/db/seeds/index.ts`
- [X] T045 [US4] Generate room ranges 101–116, 201–216, 302–306 and 301 using the corresponding returned category ID, with valid bed types/quantities and positive limits in `packages/api/src/db/seeds/index.ts`
- [X] T046 [US4] Add seed verification output or assertions proving all 38 rooms are linked to the expected category in `packages/api/src/db/seeds/index.ts`
- [X] T047 [US4] Preserve the seeded `Quartos` routes and administrator access while adding room/category inventory in `packages/api/src/db/seeds/index.ts`

**Checkpoint**: Seeded inventory is complete, varied and relationally correct.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature and update acceptance documentation.

- [ ] T048 [P] Add response-field coverage for `descricao` and `status` across API and web tests in `packages/api/src` and `packages/web/src`
- [X] T049 [P] Review changed web pages for native `<select>` or in-flow filter cards and replace them with shared shadcn controls in `packages/web/src`
- [ ] T050 Run Prisma generation/migration, seed, API tests, web tests and web build according to `specs/012-room-lifecycle/quickstart.md`
- [ ] T051 Validate acceptance flows for search, pagination, overlay/direct filters, icon actions, labeled `Pesquisar` button and seed relationships in `specs/012-room-lifecycle/quickstart.md`
- [ ] T052 Update checklist status and implementation notes after acceptance validation in `specs/012-room-lifecycle/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: no dependencies.
- **Phase 2**: depends on Phase 1 and blocks all user stories.
- **Phase 3 / US1**: depends on Phase 2 and is the MVP editing increment.
- **Phase 4 / US2**: depends on US1 update contracts/use cases because inactivation is an update of `status`.
- **Phase 5 / US3**: depends on Phase 2 query contracts and integrates with the existing list pages; it can proceed alongside late US1/US2 work where files do not overlap.
- **Phase 6 / US4**: depends on the final Prisma model and can proceed in parallel with the web stories after Phase 2.
- **Phase 7**: depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: foundational phase required; no other story required.
- **US2 (P1)**: depends on US1 update endpoints and forms.
- **US3 (P1)**: depends on foundational query contracts; room list implementation may overlap with US1 edit work only when files are separate.
- **US4 (P2)**: depends on persistence fields and is otherwise independent.

### Parallel Opportunities

- T004, T005, T007 and T008 can run in parallel after setup.
- In US1, category tasks T012/T014/T016/T020 can run in parallel with room tasks T013/T015/T017/T021.
- In US3, API search tests (T031/T032) can run in parallel with UI tests (T033); category direct select, room Popover and the labeled search action (T041) can proceed in parallel after T004–T007.
- US4 seed implementation can proceed in parallel with US3 UI work once the Prisma model is available.

## Parallel Example: User Story 3

```text
Track A: T031 → T034 → T035 (API search and pagination)
Track B: T033 → T036 → T037 → T041 (room list, search, overlay and labeled search action)
Track C: T038 → T039 (category select and icon-only actions)
Integration: T040 after all query-state changes are complete
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Implement category and room editing with tenant isolation.
3. Validate update persistence and bed replacement.
4. Demonstrate the edit flow before adding search/pagination and seed verification.

### Incremental Delivery

1. Foundation: shared query contracts, validation and Popover primitive.
2. US1: edit categories and rooms.
3. US2: reversible inactivation without delete operations.
4. US3: room pagination/search and corrected filter/table UX.
5. US4: deterministic linked suite inventory.
6. Polish: full automated and manual validation.

## Notes

- Every task follows the required checklist format with checkbox, sequential ID, optional `[P]`, story label in story phases and concrete paths.
- No task introduces physical deletion for categories or rooms.
- The seed must produce 38 rooms: 16 + 16 + 5 + 1, with matching category relations.
