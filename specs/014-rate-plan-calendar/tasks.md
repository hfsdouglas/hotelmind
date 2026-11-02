---

description: "Task list for Gestão de Tarifários e Calendário de Tarifação implementation"

---

# Tasks: Gestão de Tarifários e Calendário de Tarifação

**Input**: Design documents from `/specs/014-rate-plan-calendar/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/tarifarios.md](./contracts/tarifarios.md), [quickstart.md](./quickstart.md)

**Tests**: Included because the specification explicitly defines required Backend and Frontend tests covering CRUD, calendar period selection, conflict prevention, race conditions, multi-tenant isolation, and lowest-rate reservation pricing.

**Organization**: Tasks are grouped by user story (`US1`–`US5`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`..`[US5]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current workspace structure, existing room category abstractions, and shared UI primitives before adding rate plan contracts and persistence.

- [X] T001 Review existing `categorias_quartos` and `quartos` clean-architecture patterns and routes in `packages/api/src/routes/quartos/quartos_routes.ts` and `packages/web/src/pages/app/quartos/index.tsx`
- [X] T002 [P] Inspect reusable form, pagination, and table components in `packages/web/src/components/forms/CrudFormLayout.tsx`, `packages/web/src/components/data-table/paged_data_table.tsx`, and `packages/web/src/hooks/usePaginacao.ts`
- [X] T003 [P] Verify Prisma schema and migration history in `packages/api/src/prisma/schema.prisma`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared contracts, database schema with PostgreSQL `btree_gist` exclusion constraint, domain entity, errors, repository interface, and base schemas that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create shared TypeScript contracts (`Tarifario`, `TarifarioListResponse`, `TarifarioListParams`, `CreateTarifarioPayload`, `UpdateTarifarioPayload`, `PeriodoTarifarioCalendario`, `ConsultarCalendarioTarifariosParams`, `ConsultarCalendarioTarifariosResponse`, `NoiteCalculadaReserva`, `CalculoTarifaReserva`) in `packages/.contracts/src/tarifarios.ts` and export them in `packages/.contracts/src/index.ts`
- [X] T005 Add `Tarifario` model (`@@map("tarifarios")`) to `packages/api/src/prisma/schema.prisma` with fields `id` (`String @id @default(uuid())`), `hotel_id` (`String`, FK to `hoteis.id` `onDelete: Cascade`), `categoria_quarto_id` (`String`, FK to `categorias_quartos.id` `onDelete: Restrict`), `nome` (`String @db.VarChar(100)`), `data_inicio` (`DateTime @db.Date`), `data_fim` (`DateTime @db.Date`), `valor_diaria` (`Decimal @db.Decimal(12, 2)`), `ativo` (`Boolean @default(true)`), `criado_em` (`DateTime @default(now())`), and `atualizado_em` (`DateTime @updatedAt`), plus indexes `@@index([hotel_id])`, `@@index([categoria_quarto_id])`, `@@index([hotel_id, categoria_quarto_id, ativo])`, and `@@index([hotel_id, categoria_quarto_id, data_inicio, data_fim])`
- [X] T006 Create Prisma migration with `CREATE EXTENSION IF NOT EXISTS btree_gist;`, check constraints `CHECK ("data_inicio" < "data_fim")` and `CHECK ("valor_diaria" >= 0)`, and exclusion constraint `EXCLUDE USING gist ("hotel_id" WITH =, "categoria_quarto_id" WITH =, daterange("data_inicio", "data_fim", '[)') WITH &&) WHERE ("ativo" = true)` in `packages/api/src/prisma/migrations/20261102200000_create_tarifarios/migration.sql` and regenerate Prisma Client
- [X] T007 [P] Create `Tarifario` domain entity with invariant checks (`nome` trimmed 1..100 chars, half-open interval `data_inicio < data_fim`, `valor_diaria >= 0` formatted with 2 decimal places) in `packages/api/src/core/entities/tarifario.ts` and unit tests in `packages/api/src/core/entities/tarifario.spec.ts`
- [X] T008 [P] Create domain error classes (`TarifarioNotFoundError`, `TarifarioPeriodConflictError`, `TarifarioValidationError`, `TarifarioSemCoberturaError`) in `packages/api/src/core/errors/tarifario_errors.ts`
- [X] T009 Create `TarifarioRepository` interface (`create`, `update`, `find_by_id`, `find_many`, `find_periods_by_category`, `find_active_for_range`, `find_overlapping_active`) in `packages/api/src/core/repositories/tarifarios/tarifario.repository.ts` and PostgreSQL Prisma implementation translating SQLSTATE `23P01` exclusion violations into `TarifarioPeriodConflictError` in `packages/api/src/core/repositories/tarifarios/implementation/postgres_tarifario_repository.ts`
- [X] T010 [P] Create API Zod schemas (`create_tarifario_body_schema`, `update_tarifario_body_schema`, `list_tarifarios_query_schema`, `calendario_tarifarios_query_schema`, `tarifario_response_schema`, `list_tarifarios_response_schema`, `calendario_tarifarios_response_schema`) enforcing `nome` ("Obrigatório, `trim()`, entre 1 e 100 caracteres"), `data_inicio < data_fim` (`YYYY-MM-DD`), and `valor_diaria` ("Obrigatório, precisão de 2 casas decimais, `>= 0.00`") in `packages/api/src/schemas/tarifarios/tarifarios_schema.ts` and unit tests in `packages/api/src/schemas/tarifarios/tarifarios_schema.spec.ts`
- [X] T011 [P] Create web form Zod schema and pure date conversion utilities (`to_exclusive_end_date`, `to_inclusive_end_date`, `get_days_in_month`, `is_date_in_range`, `has_period_overlap`) in `packages/web/src/schemas/tarifario.schema.ts` and unit tests in `packages/web/src/schemas/tarifario.schema.spec.ts`
- [X] T012 [P] Create web API client service `tarifariosService` (`list`, `get`, `create`, `update`, `activate`, `deactivate`, `calendar`) in `packages/web/src/api/tarifarios.service.ts` and TanStack Query hooks in `packages/web/src/hooks/use_tarifarios.ts`

**Checkpoint**: Foundation ready — contracts, database schema/constraints, repository, schemas, and web client services are in place.

---

## Phase 3: User Story 1 - Cadastrar tarifário com seleção de período no calendário (Priority: P1) 🎯 MVP

**Goal**: Allow an authenticated hotel user to create a rate plan (`POST /tarifarios` and `/tarifarios/novo`) with a reusable monthly calendar supporting 2-click range selection, reset when `end < start`, month navigation preserving selection, and bidirectional synchronization with form date inputs.

**Independent Test**: Open `/tarifarios/novo`, select a valid active category, select start and end dates on the calendar (verifying 2-click selection, reset when end < start, and bidirectional input sync), enter name and daily rate, save, and verify `POST /tarifarios` persists the half-open interval `[data_inicio, data_fim)` with `ativo = true` and redirects to `/tarifarios`.

### Tests for User Story 1

- [X] T013 [P] [US1] Add unit tests for `CriarTarifarioUseCase` covering valid creation (`ativo = true` default), category validation, trimmed name, decimal normalization, and date validation in `packages/api/src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts`
- [X] T014 [P] [US1] Add component tests for `TarifarioCalendar` and `TarifarioForm` covering 2-click range selection, reset when second click is before start date, clear selection, month navigation preserving selection, and bidirectional sync with date inputs in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`

### Implementation for User Story 1

- [X] T015 [US1] Implement `CriarTarifarioUseCase` validating active hotel category ownership, half-open interval `[data_inicio, data_fim)`, conflict check, and default `ativo = true` in `packages/api/src/core/usecases/tarifarios/criar_tarifario_use_case.ts`
- [X] T016 [US1] Implement `POST /tarifarios` route in `packages/api/src/routes/tarifarios/tarifarios_routes.ts` and register `tarifarios_routes` in `packages/api/src/plugins/fastify_routes.ts`
- [X] T017 [P] [US1] Create `TarifarioStatusBadge` component in `packages/web/src/components/tarifarios/tarifario_status_badge.tsx` and `TarifarioPeriodSummary` component in `packages/web/src/components/tarifarios/tarifario_period_summary.tsx`
- [X] T018 [US1] Create `TarifarioCalendarDay` component in `packages/web/src/components/tarifarios/tarifario_calendar_day.tsx` and reusable `TarifarioCalendar` monthly calendar component (previous/next/current month navigation, 2-click range selection, reset on `end < start`, clear selection, responsive single-month layout) in `packages/web/src/components/tarifarios/tarifario_calendar.tsx`
- [X] T019 [US1] Create shared `TarifarioForm` component with bidirectional synchronization between date inputs (`data_inicio`, `data_fim_efetiva`) and `TarifarioCalendar`, converting to half-open `[data_inicio, data_fim)` on submit in `packages/web/src/components/tarifarios/tarifario_form.tsx`
- [X] T020 [US1] Create rate plan creation page `/tarifarios/novo` with breadcrumb/back navigation, `TarifarioForm`, success toast, and redirect to `/tarifarios` in `packages/web/src/pages/app/tarifarios/novo.tsx`

**Checkpoint**: User Story 1 (MVP rate plan creation + interactive calendar selection) is functional and independently testable.

---

## Phase 4: User Story 2 - Prevenir conflitos e visualizar períodos ocupados no calendário (Priority: P1)

**Goal**: Display existing rate plan periods on the calendar for the selected hotel and category (`GET /tarifarios/calendario`), allow inspecting existing rate plan details on day interaction, allow consecutive periods (`[01/03, 01/04)` + `[01/04, 01/05)`), and block overlapping active periods in UI, domain use case, and PostgreSQL exclusion constraint (HTTP `409`), including under concurrent requests.

**Independent Test**: With an active rate plan for `2027-03-01` to `2027-04-01`, load the calendar for the same category, inspect occupied days to see rate plan details, verify selecting `15/03` to `15/04` highlights a conflict and returns `409` on submit, verify `01/04` to `01/05` succeeds as a consecutive period, and verify concurrent overlapping creations allow only one to succeed.

### Tests for User Story 2

- [X] T021 [P] [US2] Add unit and concurrency tests for `ConsultarPeriodosTarifariosUseCase`, consecutive half-open periods (`[2027-03-01, 2027-04-01)` and `[2027-04-01, 2027-05-01)`), overlapping period rejection (`TarifarioPeriodConflictError`), and race-condition handling in `packages/api/src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts`
- [X] T022 [P] [US2] Add calendar conflict and occupied-period inspection tests (visual non-color indicators, occupied day popover/details, conflict alert before submit) in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`

### Implementation for User Story 2

- [X] T023 [US2] Implement `ConsultarPeriodosTarifariosUseCase` scoped by authenticated `hotel_id` and `categoria_quarto_id` in `packages/api/src/core/usecases/tarifarios/consultar_periodos_tarifarios_use_case.ts`
- [X] T024 [US2] Register `GET /tarifarios/calendario` route (before `/tarifarios/:id`) and map `TarifarioPeriodConflictError` to HTTP `409` in `packages/api/src/routes/tarifarios/tarifarios_routes.ts`
- [X] T025 [US2] Enhance `TarifarioCalendarDay`, `TarifarioCalendar`, and `TarifarioPeriodSummary` to render occupied and conflicting periods using non-color visual indicators (borders, icons, badges) and interactive details inspection (name, effective period, daily rate, status) in `packages/web/src/components/tarifarios/tarifario_calendar_day.tsx`, `packages/web/src/components/tarifarios/tarifario_calendar.tsx`, and `packages/web/src/components/tarifarios/tarifario_period_summary.tsx`

**Checkpoint**: User Stories 1 and 2 work together with full calendar conflict visualization and `409` backend/DB enforcement.

---

## Phase 5: User Story 3 - Listar e consultar tarifários do hotel (Priority: P1)

**Goal**: Provide a paginated, filterable rate plan listing page (`/tarifarios` and `GET /tarifarios`, `GET /tarifarios/:id`) showing rate plan name, room category, start date, effective end date, daily rate, status badge, and row actions, with loading, empty, and error states.

**Independent Test**: Open `/tarifarios`, verify only rate plans from the authenticated hotel are listed with formatted currency and inclusive effective end date, filter by room category and active/inactive status, change pagination page/limit, and inspect a rate plan.

### Tests for User Story 3

- [X] T026 [P] [US3] Add unit tests for `ListarTarifariosUseCase` and `BuscarTarifarioUseCase` covering pagination, category/status filters, search, and not-found handling in `packages/api/src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts`
- [X] T027 [P] [US3] Add web page tests for `/tarifarios` list rendering, category/status filters, loading/empty/error states, and pagination in `packages/web/src/pages/app/tarifarios/tarifarios_pages.spec.tsx`

### Implementation for User Story 3

- [X] T028 [P] [US3] Implement `ListarTarifariosUseCase` in `packages/api/src/core/usecases/tarifarios/listar_tarifarios_use_case.ts` and `BuscarTarifarioUseCase` in `packages/api/src/core/usecases/tarifarios/buscar_tarifario_use_case.ts`
- [X] T029 [US3] Register `GET /tarifarios` and `GET /tarifarios/:id` endpoints in `packages/api/src/routes/tarifarios/tarifarios_routes.ts`
- [X] T030 [US3] Implement rate plan listing page `/tarifarios` with `ListPageLayout`, `PagedDataTable`, category and status filters, details view dialog/action, edit link, and activate/deactivate action in `packages/web/src/pages/app/tarifarios/index.tsx`

**Checkpoint**: Rate plan listing, filtering, pagination, and creation flows are complete.

---

## Phase 6: User Story 4 - Editar, desativar e reativar tarifários (Priority: P2)

**Goal**: Allow editing an existing rate plan (`/tarifarios/:id/editar` and `PATCH /tarifarios/:id`) while excluding the rate plan itself from conflict checks, deactivating (`PATCH /tarifarios/:id/desativar`) with explicit user confirmation while preserving history, and reactivating (`PATCH /tarifarios/:id/ativar`) with conflict re-validation.

**Independent Test**: Open `/tarifarios/:id/editar`, confirm the current period is selected on the calendar without self-conflict, update fields and save; deactivate a rate plan via confirmation dialog and verify it remains in the list as inactive without blocking new active periods; attempt to reactivate it when another active rate plan now occupies the period and confirm `409` conflict blocking.

### Tests for User Story 4

- [X] T031 [P] [US4] Add unit tests for `EditarTarifarioUseCase` (excluding own `id` from conflict detection), `DesativarTarifarioUseCase`, and `AtivarTarifarioUseCase` (re-validating period conflicts on reactivation) in `packages/api/src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts`
- [X] T032 [P] [US4] Add web tests for `/tarifarios/:id/editar` prefilled form/calendar without self-conflict and `AlertDialog` confirmation on deactivation in `packages/web/src/pages/app/tarifarios/tarifarios_pages.spec.tsx`

### Implementation for User Story 4

- [X] T033 [P] [US4] Implement `EditarTarifarioUseCase` in `packages/api/src/core/usecases/tarifarios/editar_tarifario_use_case.ts`, `DesativarTarifarioUseCase` in `packages/api/src/core/usecases/tarifarios/desativar_tarifario_use_case.ts`, and `AtivarTarifarioUseCase` in `packages/api/src/core/usecases/tarifarios/ativar_tarifario_use_case.ts`
- [X] T034 [US4] Register `PATCH /tarifarios/:id`, `PATCH /tarifarios/:id/ativar`, and `PATCH /tarifarios/:id/desativar` endpoints in `packages/api/src/routes/tarifarios/tarifarios_routes.ts`
- [X] T035 [US4] Implement edit page `/tarifarios/:id/editar` loading existing rate plan data, passing `excludeTarifarioId={id}` to `TarifarioForm`/`TarifarioCalendar`, and providing confirmed deactivation via `AlertDialog` in `packages/web/src/pages/app/tarifarios/[id]/editar.tsx`
- [X] T036 [US4] Register `/tarifarios`, `/tarifarios/novo`, and `/tarifarios/:id/editar` in `packages/web/src/routes.tsx` and add `Tarifários` module routes to `packages/api/src/db/seeds/index.ts`

**Checkpoint**: Full rate plan lifecycle (list, create, edit, deactivate, reactivate) is operational.

---

## Phase 7: User Story 5 - Isolamento multi-tenant e cálculo pelo menor valor aplicável (Priority: P2)

**Goal**: Enforce strict multi-tenant isolation (`request.user.hotelId`) across all rate plan endpoints and implement `TarifarioPricingService` and `CalcularTarifaReservaUseCase` to calculate reservation daily rates night-by-night using the lowest applicable active rate plan.

**Independent Test**: Verify any attempt by Hotel A to read, edit, activate, deactivate, or reference categories/rate plans of Hotel B is rejected (`404`); verify `CalcularTarifaReservaUseCase` evaluates each night in `[check_in, check_out)` and picks the lowest active `valor_diaria` when multiple eligible rate plans exist or across boundary nights, ignoring inactive rate plans.

### Tests for User Story 5

- [X] T037 [P] [US5] Add unit tests for `TarifarioPricingService` and `CalcularTarifaReservaUseCase` covering multi-night stays across consecutive rate plans, lowest-rate selection when multiple active rate plans are eligible on a night, exclusion of inactive rate plans, and missing coverage errors in `packages/api/src/core/services/tarifario_pricing_service.spec.ts`
- [X] T038 [P] [US5] Add HTTP injection tests for `tarifarios_routes` verifying cross-tenant isolation (`hotel_id` from JWT only, rejecting foreign `tarifario` or `categoria_quarto_id`) and all 7 endpoints (`GET /tarifarios`, `GET /tarifarios/calendario`, `GET /tarifarios/:id`, `POST /tarifarios`, `PATCH /tarifarios/:id`, `PATCH /tarifarios/:id/ativar`, `PATCH /tarifarios/:id/desativar`) in `packages/api/src/routes/tarifarios/tarifarios_routes.spec.ts`

### Implementation for User Story 5

- [X] T039 [US5] Implement `TarifarioPricingService` with exact decimal night-by-night lowest-value calculation in `packages/api/src/core/services/tarifario_pricing_service.ts`
- [X] T040 [US5] Implement `CalcularTarifaReservaUseCase` orchestrating tenant/category validation and `TarifarioPricingService` in `packages/api/src/core/usecases/tarifarios/calcular_tarifa_reserva_use_case.ts`

**Checkpoint**: Multi-tenant security and lowest-rate reservation calculation are verified end-to-end.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation of code formatting, type safety, test suites, and quickstart scenarios.

- [X] T041 [P] Verify `snake_case` naming compliance and Biome formatting/linting across `packages/.contracts`, `packages/api`, and `packages/web`
- [X] T042 Run full test suites and production build (`pnpm --filter api test`, `pnpm --filter web test`, `pnpm --filter web build`) to validate all acceptance criteria in `specs/014-rate-plan-calendar/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories (`T004`–`T012`).
- **Phase 3 (US1 - P1 MVP)**: Depends on Phase 2 completion.
- **Phase 4 (US2 - P1)**: Depends on Phase 2 and integrates with US1 calendar and creation flow.
- **Phase 5 (US3 - P1)**: Depends on Phase 2; backend (`T028`–`T029`) and frontend list (`T030`) can proceed in parallel with US1/US2 calendar work where files do not overlap.
- **Phase 6 (US4 - P2)**: Depends on US1 (`TarifarioForm`/`TarifarioCalendar`) and US3 (`/tarifarios` list actions).
- **Phase 7 (US5 - P2)**: Depends on Phase 2; `TarifarioPricingService` (`T037`, `T039`, `T040`) can run in parallel with US1–US4 UI work, while full route injection tests (`T038`) complete after all 7 routes are registered.
- **Phase 8 (Polish)**: Depends on all user stories (`US1`–`US5`) being complete.

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Starts immediately after Phase 2.
- **User Story 2 (P1)**: Extends US1 calendar with occupied periods and conflict enforcement.
- **User Story 3 (P1)**: Can be developed right after Phase 2 alongside US1/US2.
- **User Story 4 (P2)**: Reuses `TarifarioForm` and `TarifarioCalendar` from US1/US2 and integrates into US3 listing actions.
- **User Story 5 (P2)**: Domain pricing service is independent after Phase 2; route isolation tests validate all endpoints from US1–US4.

### Parallel Opportunities

- In Phase 2, `T007`, `T008`, `T010`, `T011`, and `T012` can run in parallel after `T004`.
- In US1, backend use case tests/implementation (`T013`, `T015`, `T016`) can run in parallel with frontend calendar/form components (`T014`, `T017`, `T018`, `T019`).
- In US5, `TarifarioPricingService` (`T037`, `T039`, `T040`) can be built in parallel with frontend pages in US3/US4.

---

## Parallel Example: User Story 1 (MVP)

```bash
# Backend track (API):
Task: "T013 [P] [US1] Add unit tests for CriarTarifarioUseCase in packages/api/src/core/usecases/tarifarios/tarifarios_use_cases.spec.ts"
Task: "T015 [US1] Implement CriarTarifarioUseCase in packages/api/src/core/usecases/tarifarios/criar_tarifario_use_case.ts"
Task: "T016 [US1] Implement POST /tarifarios route in packages/api/src/routes/tarifarios/tarifarios_routes.ts"

# Frontend track (Web):
Task: "T014 [P] [US1] Add component tests for TarifarioCalendar and TarifarioForm in packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx"
Task: "T017 [P] [US1] Create TarifarioStatusBadge and TarifarioPeriodSummary in packages/web/src/components/tarifarios/"
Task: "T018 [US1] Create TarifarioCalendarDay and TarifarioCalendar in packages/web/src/components/tarifarios/tarifario_calendar.tsx"
Task: "T019 [US1] Create shared TarifarioForm in packages/web/src/components/tarifarios/tarifario_form.tsx"
Task: "T020 [US1] Create rate plan creation page /tarifarios/novo in packages/web/src/pages/app/tarifarios/novo.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Core)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational contracts, Prisma migration with `btree_gist`, repository, and schemas).
2. Complete Phase 3 (US1: Create rate plan + interactive monthly calendar).
3. Complete Phase 4 (US2: Calendar occupied periods + conflict prevention).
4. Validate creation and conflict prevention independently.

### Incremental Delivery

1. **Foundation** (`T001`–`T012`): Shared contracts, DB exclusion constraint, entity, repository, schemas, and web service.
2. **US1 & US2** (`T013`–`T025`): Rate plan creation, reusable calendar, period sync, occupied period inspection, and `409` conflict prevention.
3. **US3** (`T026`–`T030`): Paginated rate plan list `/tarifarios` with category and status filters.
4. **US4** (`T031`–`T036`): Rate plan editing (`/tarifarios/:id/editar` without self-conflict), confirmed deactivation, and conflict-checked reactivation.
5. **US5 & Polish** (`T037`–`T042`): Multi-tenant isolation verification, lowest-rate night-by-night reservation pricing service, and full test/build validation.
