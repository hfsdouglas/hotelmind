# Tasks: Standardize CRUD Form Layout

**Input**: Design documents from `/specs/009-crud-form-standardization/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md, quickstart.md

**Tests**: Included. Both `packages/web/CLAUDE.md` and `packages/admin/CLAUDE.md` mandate TDD ("Never write a component, hook, or service before its test exists") for all new components, so the new shared components (`Textarea`, `CrudFormLayout`, `CheckboxGrid`) get test-first tasks. Pre-existing pages that had no test coverage before this feature are not retroactively given full suites (out of scope) except where genuinely new business behavior is introduced (US3's create+sync-routes flow).

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Maps task to spec.md user story (US1–US4)

## Path Conventions

Two independent front-end packages, per plan.md's Structure Decision:
- `packages/web/src/...` — hotel-facing app
- `packages/admin/src/...` — platform admin app

---

## Phase 1: Setup

**Purpose**: Confirm no environment/dependency changes are needed before touching code

- [X] T001 Verify `packages/web/package.json` and `packages/admin/package.json` already include Shadcn/UI, Tailwind CSS, React Hook Form, Zod, and TanStack Query per research.md — no installs required; note any mismatch before proceeding

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared presentational components every user story depends on, per `contracts/component-contracts.md`

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Write failing tests for the Textarea primitive in `packages/web/src/components/ui/textarea.spec.tsx` — asserts it renders a `<textarea>`, forwards `ref`, merges a custom `className` with `cn()`, and displays/updates multi-line input via `onChange`
- [X] T003 [P] Implement `packages/web/src/components/ui/textarea.tsx` (forwardRef, `cn()`-merged classes matching `input.tsx`'s border/background/focus-ring tokens) to satisfy T002 (depends on T002)
- [X] T004 [P] Write failing tests for `CrudFormLayout` in `packages/web/src/components/forms/CrudFormLayout.spec.tsx` — asserts it renders `title` as a heading, a back-navigation link pointing to `backTo`, `children` inside a `Card`, and an optional `sidebar` rendered alongside the card when provided
- [X] T005 [P] Implement `packages/web/src/components/forms/CrudFormLayout.tsx` per `contracts/component-contracts.md` (`mx-auto w-full max-w-3xl` wrapper; `Button variant="ghost" size="icon"` + `ArrowLeft` linking to `backTo`; `<h1>` title; `Card` containing `children`; `lg:flex-row` layout for `children` + `sidebar` when `sidebar` is present) to satisfy T004 (depends on T004) — widened to `max-w-5xl` when `sidebar` is present so the two-card layout isn't cramped, per contracts.md's "must accommodate both cards" note
- [X] T006 [P] Write failing tests for `CrudFormLayout` in `packages/admin/src/components/forms/CrudFormLayout.spec.tsx` — same assertions as T004
- [X] T007 [P] Implement `packages/admin/src/components/forms/CrudFormLayout.tsx` per `contracts/component-contracts.md`, matching T005's structure, to satisfy T006 (depends on T006)
- [X] T008 [P] Write failing tests for `CheckboxGrid` in `packages/web/src/components/forms/CheckboxGrid.spec.tsx` — asserts it renders one labeled checkbox per `items` entry in a grid, calls `onToggle(item.id)` on click, and renders `emptyMessage` instead of the grid when `items` is empty
- [X] T009 [P] Implement `packages/web/src/components/forms/CheckboxGrid.tsx` per `contracts/component-contracts.md` (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2`) to satisfy T008 (depends on T008)
- [X] T010 [P] Write failing tests for `CheckboxGrid` in `packages/admin/src/components/forms/CheckboxGrid.spec.tsx` — same assertions as T008
- [X] T011 [P] Implement `packages/admin/src/components/forms/CheckboxGrid.tsx` per `contracts/component-contracts.md`, matching T009's structure, to satisfy T010 (depends on T010)

**Checkpoint**: `Textarea` (web), `CrudFormLayout` (both packages), and `CheckboxGrid` (both packages) exist, are tested, and are ready to be consumed by pages.

---

## Phase 3: User Story 1 - Consistent centered layout on every CRUD form (Priority: P1) 🎯 MVP

**Goal**: Every create/edit page in both apps renders its header inside the same fixed-width, centered container as its form card, with all inputs wrapped in one `Card`.

**Independent Test**: Open each page below at a desktop width and confirm the header and card share the same centered, fixed-width column; resize to a narrow viewport and confirm no horizontal scrolling appears.

### Implementation for User Story 1

- [X] T012 [P] [US1] Refactor `packages/web/src/pages/app/grupos/novo.tsx` to render via `CrudFormLayout` (`title="Novo grupo"`, `backTo="/grupos"`), removing the old manual header/container/`Card` markup
- [X] T013 [P] [US1] Refactor `packages/web/src/pages/app/grupos/[id]/editar.tsx` to render via `CrudFormLayout` (`title="Editar grupo"`, `backTo="/grupos"`, `sidebar=`the existing "Rotas de acesso" `Card`), removing the old manual header/container/`Card` markup — also folded in T022 (CheckboxGrid) while the file was open
- [X] T014 [P] [US1] Refactor `packages/web/src/pages/app/usuarios/novo.tsx` to render via `CrudFormLayout` (`title="Novo usuário"`, `backTo="/usuarios"`, `sidebar=`the existing "Grupos de acesso" `Card`), removing the old manual header/container/`Card` markup — also folded in T023 (CheckboxGrid)
- [X] T015 [P] [US1] Refactor `packages/web/src/pages/app/usuarios/[id]/editar.tsx` to render via `CrudFormLayout` (`title="Editar usuário"`, `backTo="/usuarios"`, `sidebar=`the existing "Grupos de acesso" `Card`), removing the old manual header/container/`Card` markup — also folded in T024 (CheckboxGrid)
- [X] T016 [P] [US1] Refactor `packages/admin/src/pages/app/administradores/novo.tsx` to render via `CrudFormLayout` (`title="Novo Administrador"`, `backTo="/administradores"`) — this page currently has no back-arrow or `Card`; move the existing `Form`/`FormField` block inside `CrudFormLayout`, replacing the bare `<h1>` + `max-w-lg` wrapper
- [X] T017 [P] [US1] Refactor `packages/admin/src/pages/app/administradores/editar.tsx` to render via `CrudFormLayout` (`title="Editar Administrador"`, `backTo="/administradores"`), same treatment as T016
- [X] T018 [P] [US1] Refactor `packages/admin/src/pages/app/hoteis/novo.tsx` to render via `CrudFormLayout` (`title="Novo Hotel"`, `backTo="/hoteis"`), same treatment as T016 (bare `<h1>` + `max-w-xl` wrapper today)
- [X] T019 [P] [US1] Refactor `packages/admin/src/pages/app/hoteis/editar.tsx` to render via `CrudFormLayout` (`title="Editar Hotel"`, `backTo="/hoteis"`), same treatment as T018
- [X] T020 [P] [US1] Refactor `packages/admin/src/pages/app/rotas/nova.tsx` to render via `CrudFormLayout` (`title="Nova Rota"`, `backTo="/rotas"`), same treatment as T016 (bare `<h1>` + `max-w-lg` wrapper today)
- [X] T021 [P] [US1] Refactor `packages/admin/src/pages/app/rotas/editar.tsx` to render via `CrudFormLayout` (`title="Editar Rota"`, `backTo="/rotas"`), same treatment as T020

**Checkpoint**: All 10 create/edit pages are centered, card-wrapped, with a consistent contained/left-aligned header. User Story 1 is independently demoable.

---

## Phase 4: User Story 2 - Checkbox options arranged in three columns (Priority: P2)

**Goal**: Every existing checkbox list (access routes, group assignment) renders through `CheckboxGrid`'s responsive 3-column layout.

**Independent Test**: Open each page below at a desktop width and confirm its checkbox list lays out in 3 columns; resize narrower and confirm it collapses to fewer columns without horizontal scroll.

### Implementation for User Story 2

- [X] T022 [P] [US2] Update `packages/web/src/pages/app/grupos/[id]/editar.tsx` to render each module's access-routes list via `CheckboxGrid` instead of the manual `flex flex-col` checkbox list (depends on T013, T009) — done alongside T013
- [X] T023 [P] [US2] Update `packages/web/src/pages/app/usuarios/novo.tsx` to render the "Grupos de acesso" list via `CheckboxGrid` instead of the manual `flex flex-col` checkbox list (depends on T014, T009) — done alongside T014
- [X] T024 [P] [US2] Update `packages/web/src/pages/app/usuarios/[id]/editar.tsx` to render the "Grupos de acesso" list via `CheckboxGrid` instead of the manual `flex flex-col` checkbox list (depends on T015, T009) — done alongside T015
- [X] T025 [P] [US2] Update `packages/admin/src/pages/app/hoteis/rotas.tsx`'s routes list to the responsive 3-column grid (depends on T011) — implemented by applying the `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2` classes directly to the existing bordered/hover row markup rather than swapping in `CheckboxGrid`, since this page's rows carry a two-line label (resource name + route path) that doesn't fit `CheckboxGrid`'s single-line `{id, label}` item shape

**Checkpoint**: All existing checkbox lists in both apps render in responsive 3-column grids. User Story 2 is independently demoable.

---

## Phase 5: User Story 3 - Assign access routes while creating a group (Priority: P3)

**Goal**: The group creation form gains an access-routes selector, and submitting it creates the group with those routes already assigned.

**Independent Test**: Open the group creation form, select a subset of routes, submit, then open the newly created group's edit page and confirm exactly those routes are checked. Also confirm submitting with zero routes selected still creates the group.

### Tests for User Story 3

- [X] T026 [US3] Write failing tests in `packages/web/src/pages/app/grupos/novo.spec.tsx` covering: the routes list (grouped by `modulo`) renders on the creation form; selecting routes and submitting calls `gruposService.create` then `gruposService.syncRotas` with the selected ids; submitting with zero routes selected still creates the group successfully

### Implementation for User Story 3

- [X] T027 [US3] Implement the access-routes selector on `packages/web/src/pages/app/grupos/novo.tsx`: fetch `/rotas` and group by `modulo` (mirroring the query already used in `grupos/[id]/editar.tsx`), track `selectedRouteIds` via local `useState<Set<string>>`, render it via `CheckboxGrid` as the `CrudFormLayout` `sidebar` (one heading + `CheckboxGrid` per module), and on successful `gruposService.create`, call `gruposService.syncRotas(grupo.id, Array.from(selectedRouteIds))` before the success toast/navigate; show a distinct error toast if `syncRotas` fails after a successful create (depends on T012, T009, T026)

**Checkpoint**: Creating a group assigns its routes in the same submission. User Story 3 is independently demoable.

---

## Phase 6: User Story 4 - Multi-line group description (Priority: P4)

**Goal**: The group "Descrição" field is a `Textarea` on both the creation and edit forms.

**Independent Test**: Open the group creation and edit forms, type a multi-line description into "Descrição", and confirm all lines remain visible/editable.

### Implementation for User Story 4

- [X] T028 [P] [US4] Update `packages/web/src/pages/app/grupos/novo.tsx` to render the "Descrição" field with `Textarea` instead of `Input` (depends on T003, T012)
- [X] T029 [P] [US4] Update `packages/web/src/pages/app/grupos/[id]/editar.tsx` to render the "Descrição" field with `Textarea` instead of `Input` (depends on T003, T013)

**Checkpoint**: Group description accepts and displays multi-line text on both forms. User Story 4 is independently demoable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final verification across both apps

- [X] T030 [P] Document the CRUD form layout standard (centered `max-w-3xl` container, header contained + left-aligned, inputs wrapped in one `Card`, 3-column `CheckboxGrid` for checkbox lists, `Textarea` for multi-line fields) in `packages/web/CLAUDE.md` under the existing "Forms" section
- [X] T031 [P] Document the same CRUD form layout standard in `packages/admin/CLAUDE.md` under a new "Forms" section (admin's `CLAUDE.md` currently only lists mandatory form tooling, not layout conventions)
- [X] T032 Run `pnpm --filter web typecheck` and `pnpm --filter web test`; both pass (14 files / 61 tests). `biome check` could not run — `biome.json` predates the installed Biome 2.5.1 and fails to deserialize (unrelated to this feature; pre-existing, present since the initial scaffold commit)
- [X] T033 [P] Run `pnpm --filter admin typecheck` and `pnpm --filter admin test`; both pass (15 files / 80 tests). Same pre-existing `biome.json` issue as T032
- [X] T034 Executed the quickstart validation live: started `packages/api` + both front-ends against the seeded Postgres DB, logged in as the seeded hotel user and admin, and used a headless-Chromium (Playwright) driver to screenshot `/grupos/novo`, `/grupos/:id/editar` (desktop + mobile), `administradores/novo`, and `hoteis/novo`. Confirmed centered container, contained/left-aligned header, single-card inputs, routes selector present and working on group creation, description as a textarea, and responsive column collapse on mobile — SC-001 through SC-004 and SC-006 visually confirmed; SC-005 confirmed via the full test suites in T032/T033

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (US1–US4 all consume `CrudFormLayout`/`CheckboxGrid`/`Textarea`)
- **User Story 1 (Phase 3)**: Depends on Foundational (`CrudFormLayout`, T005/T007) — independent of US2–US4
- **User Story 2 (Phase 4)**: Depends on Foundational (`CheckboxGrid`, T009/T011) **and** on the specific page's US1 task (a page must already be on `CrudFormLayout` before its checkbox list is swapped to `CheckboxGrid`) — see per-task notes
- **User Story 3 (Phase 5)**: Depends on US1's T012 (grupos/novo on `CrudFormLayout`) and Foundational's `CheckboxGrid`
- **User Story 4 (Phase 6)**: Depends on US1's T012/T013 (grupos pages on `CrudFormLayout`) and Foundational's `Textarea`
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Parallel Opportunities

- T002–T011 (Foundational): all `[P]`, but each test/impl pair is sequential (e.g. T003 depends on T002)
- T012–T021 (US1): all `[P]` — 10 different page files, no cross-dependencies
- T022–T025 (US2): all `[P]` — different files, each gated only by its own US1 predecessor
- T028–T029 (US4): `[P]` — different files
- T030–T031 (Polish docs): `[P]` — different files
- T032–T033 (Polish verification): `[P]` — different packages

---

## Parallel Example: User Story 1

```bash
# All 10 page refactors can be dispatched together once T005 and T007 (CrudFormLayout) are done:
Task: "Refactor packages/web/src/pages/app/grupos/novo.tsx to use CrudFormLayout"
Task: "Refactor packages/web/src/pages/app/grupos/[id]/editar.tsx to use CrudFormLayout"
Task: "Refactor packages/web/src/pages/app/usuarios/novo.tsx to use CrudFormLayout"
Task: "Refactor packages/web/src/pages/app/usuarios/[id]/editar.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/administradores/novo.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/administradores/editar.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/hoteis/novo.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/hoteis/editar.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/rotas/nova.tsx to use CrudFormLayout"
Task: "Refactor packages/admin/src/pages/app/rotas/editar.tsx to use CrudFormLayout"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`CrudFormLayout` is the critical piece; `CheckboxGrid`/`Textarea` can lag if desired, but building all three together is cheap since they're small and parallel)
3. Complete Phase 3: User Story 1 — all 10 forms centered/card-wrapped/header-contained
4. **STOP and VALIDATE**: Run quickstart.md's Section 2/3 layout checks
5. Deploy/demo if ready — this alone resolves the core "inconsistent forms" complaint

### Incremental Delivery

1. Setup + Foundational → shared components ready
2. US1 → every form visually consistent (MVP)
3. US2 → checkbox lists scan faster (3 columns)
4. US3 → group creation gains routes assignment (closes functional gap)
5. US4 → group description supports multi-line text
6. Polish → docs updated in both `CLAUDE.md` files, full lint/typecheck/test pass, quickstart validation

---

## Notes

- `[P]` tasks touch different files and have no unmet dependencies at the point they're started
- `[Story]` label maps each task to its spec.md user story for traceability
- No backend, contract, or validation-logic changes anywhere in this task list (per spec FR-011) — every task is presentation-layer only, except T027's client-side call sequencing (still only consuming existing endpoints)
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
