---

description: "Task list template for feature implementation"
---

# Tasks: Suspense em Páginas de Pesquisa

**Input**: Design documents from `/specs/013-suspense-search-pages/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/search-suspense.md](./contracts/search-suspense.md), [quickstart.md](./quickstart.md)

**Tests**: Included because the specification requires all eight pages to preserve search behavior and define measurable success criteria for loading, empty, error, and accessibility states.

**Organization**: Tasks are grouped by user story. User Story 1 is the MVP and implements the behavior on every existing searchable/filterable page; User Story 2 verifies parity; User Story 3 documents the future-page standard.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing frontend boundaries and establish the implementation inventory without changing API contracts.

- [X] T001 Review the eight in-scope page query keys, URL parameters, table column counts, and existing page tests against [plan.md](./plan.md) and [data-model.md](./data-model.md)
- [X] T002 [P] Add focused test fixtures for a pending result, resolved result, empty result, handled error, and accessible status in `packages/admin/src/test/search_suspense_fixtures.tsx`
- [X] T003 [P] Add focused test fixtures for a pending result, resolved result, empty result, handled error, and accessible status in `packages/web/src/test/search_suspense_fixtures.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the local primitives and transition behavior required by every user story.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [X] T004 [P] Implement the `admin` results-only Suspense boundary with table-shaped skeleton, `aria-busy`, `role="status"`, polite loading/completion announcements, and children fallback in `packages/admin/src/components/data-table/search_results_suspense.tsx`
- [X] T005 [P] Implement the `web` results-only Suspense boundary with table-shaped skeleton, `aria-busy`, `role="status"`, polite loading/completion announcements, and children fallback in `packages/web/src/components/data-table/search_results_suspense.tsx`
- [X] T006 [P] Add the local skeleton primitive used by the `admin` results boundary in `packages/admin/src/components/ui/skeleton.tsx`
- [X] T007 [P] Add the local skeleton primitive used by the `web` results boundary in `packages/web/src/components/ui/skeleton.tsx`
- [X] T008 Update `packages/admin/src/hooks/usePaginacao.ts` to wrap search, filter, sort, and pagination URL updates in a React transition and expose the pending state without changing existing parameter names
- [X] T009 Update `packages/web/src/hooks/usePaginacao.ts` to wrap search, filter, sort, and pagination URL updates in a React transition and expose the pending state without changing existing parameter names
- [X] T010 [P] Add component tests for the `admin` boundary skeleton, preserved children, busy state, live status, and focus preservation in `packages/admin/src/components/data-table/search_results_suspense.spec.tsx`
- [X] T011 [P] Add component tests for the `web` boundary skeleton, preserved children, busy state, live status, and focus preservation in `packages/web/src/components/data-table/search_results_suspense.spec.tsx`

**Checkpoint**: Both applications have independently testable Suspense boundaries, skeletons, accessibility status, and transition-aware URL updates.

---

## Phase 3: User Story 1 - Pesquisar sem perder o contexto da página (Priority: P1) 🎯 MVP

**Goal**: Every current searchable/filterable page shows the standardized result loading state, keeps previous results and controls available during a transition, and resolves to success, empty, or handled-error content.

**Independent Test**: On each of the eight routes, initiate a search/filter/sort/page change and verify previous results, active controls, skeleton/busy state, accessible status, latest-result precedence, and final success/empty/error behavior.

### Tests for User Story 1

- [X] T012 [P] [US1] Add loading, preserved-result, empty, error, and latest-query smoke tests for `admin` pages in `packages/admin/src/pages/app/hoteis/index.suspense.spec.tsx`, `packages/admin/src/pages/app/rotas/index.suspense.spec.tsx`, `packages/admin/src/pages/app/administradores/index.suspense.spec.tsx`, and `packages/admin/src/pages/app/suporte/index.suspense.spec.tsx`
- [X] T013 [P] [US1] Add loading, preserved-result, empty, error, and latest-query smoke tests for `web` pages in `packages/web/src/pages/app/grupos/index.suspense.spec.tsx`, `packages/web/src/pages/app/usuarios/index.suspense.spec.tsx`, `packages/web/src/pages/app/categorias_quartos/index.suspense.spec.tsx`, and `packages/web/src/pages/app/quartos/index.suspense.spec.tsx`

### Implementation for User Story 1

- [X] T014 [P] [US1] Refactor the hotels result query into a Suspense-compatible result child, keep title/search/actions outside the boundary, and pass the admin table column count in `packages/admin/src/pages/app/hoteis/index.tsx`
- [X] T015 [P] [US1] Refactor the routes result query into a Suspense-compatible result child, keep title/search/actions outside the boundary, and pass the admin table column count in `packages/admin/src/pages/app/rotas/index.tsx`
- [X] T016 [P] [US1] Refactor the administrators result query into a Suspense-compatible result child, keep title/search/actions outside the boundary, and pass the admin table column count in `packages/admin/src/pages/app/administradores/index.tsx`
- [X] T017 [P] [US1] Refactor the support hotels result query into a Suspense-compatible result child, keep title/search/actions outside the boundary, and preserve the existing access dialog behavior in `packages/admin/src/pages/app/suporte/index.tsx`
- [X] T018 [P] [US1] Refactor the groups result query and status URL filter into a Suspense-compatible result child, preserving the existing search/filter/table actions in `packages/web/src/pages/app/grupos/index.tsx`
- [X] T019 [P] [US1] Refactor the users result query into a Suspense-compatible result child, keep title/search/actions outside the boundary, and pass the web table column count in `packages/web/src/pages/app/usuarios/index.tsx`
- [X] T020 [P] [US1] Refactor the room-category result query and status URL filter into a Suspense-compatible result child, preserving the existing filter and empty/error behavior in `packages/web/src/pages/app/categorias_quartos/index.tsx`
- [X] T021 [P] [US1] Refactor the rooms result query and category/status filters into a Suspense-compatible result child, preserving the existing filter popover, row actions, and error behavior in `packages/web/src/pages/app/quartos/index.tsx`
- [X] T022 [US1] Add local error handling around each results-only Suspense boundary so handled request errors clear loading state and preserve the existing page error messages in `packages/admin/src/components/data-table/search_results_suspense.tsx` and `packages/web/src/components/data-table/search_results_suspense.tsx`

**Checkpoint**: User Story 1 is independently demonstrable across all eight current routes and is the recommended MVP scope.

---

## Phase 4: User Story 2 - Ter comportamento uniforme em todas as listagens atuais (Priority: P1)

**Goal**: Confirm that `admin` and `web` expose equivalent observable behavior even though their implementations remain local.

**Independent Test**: Compare the same loading, refresh, accessibility, empty, and error scenarios across all eight routes and confirm the same boundary behavior without regressions to route-specific actions.

### Tests for User Story 2

- [X] T023 [P] [US2] Add parity assertions for skeleton structure, `aria-busy`, polite status announcements, focus preservation, and control availability in `packages/admin/src/components/data-table/search_results_suspense.spec.tsx` and `packages/web/src/components/data-table/search_results_suspense.spec.tsx`
- [X] T024 [P] [US2] Extend existing data-table tests to verify table-shaped loading rows preserve column counts and action columns in `packages/admin/src/components/data-table/data_table.spec.tsx` and `packages/web/src/components/data-table/data_table.spec.tsx`
- [X] T025 [US2] Run and reconcile the eight page test files so existing search, filter, sort, pagination, row-action, empty, and error assertions remain valid after Suspense integration in `packages/admin/src/pages/app/` and `packages/web/src/pages/app/`

### Implementation for User Story 2

- [X] T026 [US2] Align accessible labels, loading text, skeleton row count, `aria-busy`, and live-status wording between `packages/admin/src/components/data-table/search_results_suspense.tsx` and `packages/web/src/components/data-table/search_results_suspense.tsx`
- [X] T027 [US2] Align transition handling for direct URL filter updates not covered by `usePaginacao`, including group status and room-category status changes, in `packages/web/src/pages/app/grupos/index.tsx` and `packages/web/src/pages/app/categorias_quartos/index.tsx`

**Checkpoint**: All eight routes provide the same observable search suspense standard while preserving their application-specific data-table APIs and actions.

---

## Phase 5: User Story 3 - Aplicar o padrão em novas páginas (Priority: P2)

**Goal**: Make the suspense standard discoverable and reusable for future searchable/filterable pages.

**Independent Test**: A developer can consult the project guidance, identify whether a new page is in scope, implement the local boundary contract, and validate initial, refresh, empty, error, and accessible states using the documented guide.

- [X] T028 [P] [US3] Document the searchable-page suspense standard, page-scope rule, React boundary requirement, skeleton shape, preserved-result behavior, and accessibility requirements in `packages/admin/CLAUDE.md`
- [X] T029 [P] [US3] Document the searchable-page suspense standard, page-scope rule, React boundary requirement, skeleton shape, preserved-result behavior, and accessibility requirements in `packages/web/CLAUDE.md`
- [X] T030 [US3] Update the feature UI contract and validation guide with the final local component names, error-boundary behavior, and example acceptance matrix in `specs/013-suspense-search-pages/contracts/search-suspense.md` and `specs/013-suspense-search-pages/quickstart.md`

**Checkpoint**: Future list pages have an explicit, testable standard and a runnable validation procedure.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature, clean up inconsistencies, and verify no unrelated routes were changed.

- [X] T031 [P] Run `pnpm --filter admin test -- --run` and resolve regressions limited to the search suspense feature in `packages/admin/src/`
- [X] T032 [P] Run `pnpm --filter web test` and resolve regressions limited to the search suspense feature in `packages/web/src/`
- [X] T033 [P] Run `pnpm --filter admin typecheck` and `pnpm --filter web typecheck` and resolve feature-related TypeScript errors in `packages/admin/src/` and `packages/web/src/`
- [ ] T034 Run `pnpm --filter admin build` and `pnpm --filter web build` and confirm the production bundles compile in `packages/admin/` and `packages/web/`
- [ ] T035 Run every manual acceptance scenario in [quickstart.md](./quickstart.md), including all eight routes and success/empty/error/accessibility states
- [ ] T036 Review the final diff to confirm no API, database, shared-contract, authentication, dashboard, or non-search page behavior changed outside `specs/013-suspense-search-pages/`, `packages/admin/src/`, `packages/web/src/`, `packages/admin/CLAUDE.md`, and `packages/web/CLAUDE.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No implementation dependency; establishes the inventory and test fixtures.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all page work.
- **Phase 3 (US1)**: Depends on Phase 2; delivers the MVP across all eight routes.
- **Phase 4 (US2)**: Depends on US1 because parity tests compare the completed local implementations.
- **Phase 5 (US3)**: Can begin after Phase 2, but final documentation should reflect the completed US1/US2 behavior.
- **Phase 6 (Polish)**: Depends on US1 and US2; T035/T036 also depend on US3 documentation updates.

### User Story Dependencies

- **US1 (P1)**: Depends only on the foundational boundary, skeleton, transition, and fixture work; no dependency on US2 or US3.
- **US2 (P1)**: Depends on US1's eight page integrations; it verifies consistency rather than adding a new user flow.
- **US3 (P2)**: Depends on the contract artifacts from planning and should be finalized after US1/US2 settle the actual component behavior.

### Parallel Opportunities

- T002 and T003 can run in parallel because they touch separate application test fixture files.
- T004–T007 and T010–T011 can run in parallel across the two applications after setup.
- T014–T021 can run in parallel by page once the foundational components and transitions are complete; each task owns a distinct page file.
- T012 and T013 can run in parallel with the page implementation work if tests are written first against the existing behavior.
- T028 and T029 can run in parallel because the application guidance files are independent.
- T031–T033 can run in parallel because they validate separate commands and packages.

## Parallel Example: User Story 1

```text
# After Phase 2 is complete, assign one task per page:
T014 packages/admin/src/pages/app/hoteis/index.tsx
T015 packages/admin/src/pages/app/rotas/index.tsx
T016 packages/admin/src/pages/app/administradores/index.tsx
T017 packages/admin/src/pages/app/suporte/index.tsx
T018 packages/web/src/pages/app/grupos/index.tsx
T019 packages/web/src/pages/app/usuarios/index.tsx
T020 packages/web/src/pages/app/categorias_quartos/index.tsx
T021 packages/web/src/pages/app/quartos/index.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational primitives.
2. Implement and test all eight pages in Phase 3.
3. Stop and validate the eight-route acceptance matrix before adding parity/documentation polish.

### Incremental Delivery

1. Deliver the local boundary and transition foundation in both applications.
2. Add the four `admin` and four `web` pages, each independently testable.
3. Verify parity across applications.
4. Publish the future-page standard and complete the full quickstart validation.

### Parallel Team Strategy

1. One developer completes the shared design/foundation in each application.
2. After Phase 2, assign separate developers to the four `admin` pages and four `web` pages.
3. A test-focused developer can prepare T012/T013 in parallel.
4. A documentation-focused developer can prepare T028/T029 and finalize T030 after implementation behavior is stable.

## Notes

- Every task follows the required checklist format: checkbox, sequential ID, optional `[P]`, required story label for story phases, and concrete file path(s).
- No task changes `packages/.contracts`, API routes, database schemas, or external payloads because the design confirmed this is a frontend-only behavior change.
- Commit creation is intentionally not included; repository guidance requires explicit user approval before any commit.
