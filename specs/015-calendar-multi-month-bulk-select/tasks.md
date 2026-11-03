---

description: "Task list for multi-month calendar view and bulk date selection"
---

# Tasks: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

**Input**: Design documents from `/specs/015-calendar-multi-month-bulk-select/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/calendar_selection.md](./contracts/calendar_selection.md), [quickstart.md](./quickstart.md)

**Tests**: Included to verify pure multi-month/bulk-selection utilities and interactive calendar/form behavior.

**Organization**: Tasks are grouped by user story (`US1`–`US3`) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `US1`, `US2`, `US3`)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm shared types and utility boundaries in `packages/web/src/schemas/tarifario.schema.ts`

- [X] T001 Export `CalendarMonthsViewCount` (`1 | 3 | 6 | 12`), `CalendarBulkSelectMode` (`'all' | 'weekdays' | 'weekends'`), and `VisibleCalendarMonth` types in `packages/web/src/schemas/tarifario.schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement pure functions for multi-month generation and bulk date selection before wiring UI components

**⚠️ CRITICAL**: Complete this phase before starting User Story UI tasks

- [X] T002 Implement `get_visible_calendar_months(start_year, start_month_zero_based, count)` using UTC month arithmetic (`1`, `3`, `6`, or `12` consecutive months, handling year boundaries) in `packages/web/src/schemas/tarifario.schema.ts`
- [X] T003 Implement `compute_bulk_selection_dates({ visible_months, mode, occupied_periods, exclude_tarifario_id })` filtering `is_current_month === true`, available dates (not occupied by another active rate plan), and weekday rules (`all`: `0..6`, `weekdays`: `1..5`, `weekends`: `0 | 6`) in `packages/web/src/schemas/tarifario.schema.ts`
- [X] T004 [P] Add unit tests for `get_visible_calendar_months` (1, 3, 6, 12 months and year-end rollover) and `compute_bulk_selection_dates` (`all`, `weekdays`, `weekends`, occupied exclusion, self-edit inclusion) in `packages/web/src/schemas/tarifario.schema.spec.ts`

**Checkpoint**: Multi-month and bulk-selection domain utilities are tested and ready for UI integration.

---

## Phase 3: User Story 1 - Alternar visualização entre 1, 3, 6 e 12 meses (Priority: P1) 🎯 MVP

**Goal**: Allow the user to switch the calendar display between `1 mês` (default), `3 meses`, `6 meses`, and `12 meses` in a responsive grid, navigating backward/forward by the selected number of months while preserving all selected dates.

**Independent Test**: Render `TarifarioCalendar`, verify it defaults to `1 mês`, select dates, switch to `3 meses`, `6 meses`, and `12 meses` verifying the corresponding number of consecutive month grids render immediately and selected dates remain checked, and click previous/next period buttons verifying the window shifts by `1`, `3`, `6`, or `12` months.

### Implementation for User Story 1

- [X] T005 [US1] Add `months_count` state (default `1`, options `1 | 3 | 6 | 12`), view selector buttons (`1 mês`, `3 meses`, `6 meses`, `12 meses`), proportional period navigation (`± months_count` months), and responsive multi-month grid rendering (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3` when `months_count > 1`) in `packages/web/src/components/tarifarios/tarifario_calendar.tsx`
- [X] T006 [P] [US1] Add component tests for default 1-month view, switching between 1, 3, 6, and 12 months, proportional period navigation, and selection preservation across view changes in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`

**Checkpoint**: User Story 1 is independently functional and tested.

---

## Phase 4: User Story 2 - Selecionar datas em massa nos meses visíveis (Priority: P1)

**Goal**: Provide bulk selection action buttons (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`) that replace the current selection with the matching available dates from the currently visible month(s) without modifying the daily rate field or auto-saving.

**Independent Test**: Render `TarifarioCalendar` and `TarifarioForm` in 1-month and multi-month views, click `Selecionar todos os dias`, `Selecionar dias da semana`, and `Selecionar fim de semana`, and verify that each action replaces the current selection exclusively with available dates from the visible months while preserving the daily rate input.

### Implementation for User Story 2

- [X] T007 [US2] Add `onReplaceSelection: (isoDates: string[]) => void` prop and bulk action buttons (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`) wired to `compute_bulk_selection_dates` in `packages/web/src/components/tarifarios/tarifario_calendar.tsx`
- [X] T008 [US2] Wire `onReplaceSelection` in `packages/web/src/components/tarifarios/tarifario_form.tsx` so bulk actions replace `datas` without altering `valor_diaria` or triggering form submission
- [X] T009 [P] [US2] Add component tests for `Selecionar todos os dias`, `Selecionar dias da semana`, and `Selecionar fim de semana` across single and multiple visible months (verifying replacement behavior, exclusion of occupied dates, and preservation of `valor_diaria`) in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`

**Checkpoint**: User Stories 1 and 2 work together seamlessly.

---

## Phase 5: User Story 3 - Ajuste fino individual e contagem em tempo real após seleção em massa (Priority: P2)

**Goal**: Allow individual date toggling (checkbox behavior) after bulk selection and display a live counter of total selected dates in the calendar toolbar and summary banner.

**Independent Test**: Perform a bulk selection (`Selecionar dias da semana`), uncheck one weekday and check one weekend day individually, and verify the selected date counter (`data-testid="calendar-selected-count"` and `TarifarioPeriodSummary`) updates immediately and no save occurs until form submission.

### Implementation for User Story 3

- [X] T010 [US3] Display live selected dates badge (`data-testid="calendar-selected-count"`) in `packages/web/src/components/tarifarios/tarifario_calendar.tsx` and ensure `TarifarioPeriodSummary` in `packages/web/src/components/tarifarios/tarifario_period_summary.tsx` reflects real-time counts after bulk + individual toggles
- [X] T011 [P] [US3] Add component test verifying bulk selection followed by individual checkbox uncheck/check updates the total selected dates count and only submits when the user clicks the save button in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`

**Checkpoint**: All user stories (`US1`–`US3`) are complete and independently tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full test suite and production build verification

- [X] T012 Run all web tarifario unit/component/page tests (`tarifario.schema.spec.ts`, `tarifario_calendar.spec.tsx`, `tarifarios_pages.spec.tsx`) and production build (`vite build`) in `packages/web` per `specs/015-calendar-multi-month-bulk-select/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies (`T001`).
- **Phase 2 (Foundational)**: Depends on Phase 1 (`T002`–`T004`) — blocks UI story phases.
- **Phase 3 (`US1` - Multi-month view)**: Depends on Phase 2 (`T005`–`T006`).
- **Phase 4 (`US2` - Bulk selection actions)**: Depends on Phase 2 and integrates with `TarifarioCalendar` from `US1` (`T007`–`T009`).
- **Phase 5 (`US3` - Fine-grained adjustment & live count)**: Depends on `US2` (`T010`–`T011`).
- **Phase 6 (Polish)**: Depends on all stories (`T012`).

### Parallel Opportunities

- `T004` can be written alongside `T002`–`T003`.
- Test tasks `T006`, `T009`, and `T011` can be developed alongside their respective component updates.

---

## Parallel Example: Foundational & Story Phases

```bash
# Phase 2: Pure utilities and unit tests
Task: "T002 & T003 in packages/web/src/schemas/tarifario.schema.ts"
Task: "T004 in packages/web/src/schemas/tarifario.schema.spec.ts"

# Phase 3-5: Calendar UI and component tests
Task: "T005, T007, T010 in packages/web/src/components/tarifarios/tarifario_calendar.tsx"
Task: "T008 in packages/web/src/components/tarifarios/tarifario_form.tsx"
Task: "T006, T009, T011 in packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1 & Phase 2 (`T001`–`T004`): pure multi-month and bulk-selection utilities + unit tests.
2. Complete Phase 3 (`T005`–`T006`): 1, 3, 6, and 12-month view selector and proportional navigation.
3. Complete Phase 4 (`T007`–`T009`): bulk selection buttons (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`).
4. Complete Phase 5 & Phase 6 (`T010`–`T012`): live count badge, fine-tuning tests, and production build validation.
