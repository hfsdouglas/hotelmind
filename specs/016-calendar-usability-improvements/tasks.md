---

description: "Task list for feature 016-calendar-usability-improvements"
---

# Tasks: Melhorias de usabilidade e ajustes no calendário de tarifários

**Input**: Design documents from `/specs/016-calendar-usability-improvements/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/calendar_usability.md, quickstart.md

**Tests**: Unit and component tests included in `packages/web` per Constitution Principle VII (Testability by Design).

**Organization**: Tasks are grouped by user story (`US1`–`US4`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline test suite and existing calendar/tarifarios components before applying changes.

- [X] T001 Verify existing calendar and tarifarios test suites pass in `packages/web/src/schemas/tarifario.schema.spec.ts`, `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx`, and `packages/web/src/pages/app/tarifarios/tarifarios_pages.spec.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hospitality weekday/weekend classification logic in the shared calendar schema module and Popover portal interaction safety.

- [X] T002 Update `compute_bulk_selection_dates` in `packages/web/src/schemas/tarifario.schema.ts` so `'weekends'` selects exclusively Friday and Saturday (`getUTCDay() === 5 || getUTCDay() === 6`) and `'weekdays'` selects Sunday through Thursday (`getUTCDay() >= 0 && getUTCDay() <= 4`) across any `visible_months`
- [X] T003 [P] Harden outside-click detection in `packages/web/src/components/ui/popover.tsx` to preserve open state when interacting with Radix `Select` portals (`[data-radix-popper-content-wrapper]`, `[data-radix-select-content]`, `[role="listbox"]`, `[role="option"]`)

**Checkpoint**: Foundation ready — user story phases can now be executed.

---

## Phase 3: User Story 1 - Classificação Hoteleira para Seleção em Massa de Dias de Semana e Fim de Semana (Priority: P1) 🎯 MVP

**Goal**: Garantir que "Selecionar fim de semana" selecione todas as sextas-feiras e sábados disponíveis e "Selecionar dias da semana" selecione todos os dias de domingo a quinta-feira disponíveis em qualquer visualização (`1`, `3`, `6` ou `12` meses).

**Independent Test**: Executar os testes unitários e de componente para `compute_bulk_selection_dates` e `TarifarioCalendar` verificando que sextas e sábados compõem o fim de semana e domingo a quinta compõem os dias da semana em 1, 3, 6 e 12 meses.

### Implementation & Tests for User Story 1

- [X] T004 [P] [US1] Update unit tests in `packages/web/src/schemas/tarifario.schema.spec.ts` to assert hospitality weekend (`Fri`, `Sat`) and weekday (`Sun`–`Thu`) selection across 1, 3, 6, and 12 visible months
- [X] T005 [US1] Update component bulk selection tests in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx` to verify "Selecionar fim de semana" (Fri–Sat) and "Selecionar dias da semana" (Sun–Thu) in 1-month and multi-month views

**Checkpoint**: User Story 1 is functional and independently verified.

---

## Phase 4: User Story 2 - Navegação Direta por Seletor de Mês/Ano e Botões Compactos com Ícones (Priority: P1)

**Goal**: Substituir o botão "Mês atual" por seletores de mês e ano que navegam imediatamente para o período escolhido preservando as datas selecionadas e a quantidade de meses exibidos, e remover os textos dos botões de período anterior e próximo mantendo apenas os ícones de seta.

**Independent Test**: Renderizar `TarifarioCalendar`, verificar a ausência do botão "Mês atual", selecionar diretamente um mês e ano nos seletores verificando a navegação imediata e a preservação das datas selecionadas, e verificar que os botões de avanço/recuo contêm apenas os ícones de seta sem texto visível.

### Implementation & Tests for User Story 2

- [X] T006 [US2] Replace the "Mês atual" button with month (`data-testid="calendar-select-month"`) and year (`data-testid="calendar-select-year"`) selectors and remove visible text labels from the previous (`data-testid="calendar-prev-period"`) and next (`data-testid="calendar-next-period"`) navigation buttons in `packages/web/src/components/tarifarios/tarifario_calendar.tsx`
- [X] T007 [US2] Add component tests in `packages/web/src/components/tarifarios/tarifario_calendar.spec.tsx` covering month/year selector navigation, preservation of selected dates and active view count (`1`, `3`, `6`, `12` months), removal of "Mês atual", and icon-only navigation buttons

**Checkpoint**: User Stories 1 and 2 are functional and independently verified.

---

## Phase 5: User Story 3 - Exibição Legível das Datas Selecionadas em Todas as Visualizações (Priority: P2)

**Goal**: Corrigir a apresentação visual do texto de identificação das datas selecionadas nas células do calendário e no resumo/contador para evitar cortes, quebras inadequadas ou sobreposições em visualizações de 1, 3, 6 e 12 meses e diferentes resoluções.

**Independent Test**: Selecionar datas em visualizações de 1, 3, 6 e 12 meses e verificar que tanto as células (`TarifarioCalendarDay`) quanto o contador (`calendar-selected-count`) e o resumo (`TarifarioPeriodSummary`) exibem a informação sem sobreposição, cortes ou quebras inadequadas.

### Implementation & Tests for User Story 3

- [X] T008 [P] [US3] Refine selected/conflict text layout and responsive overflow handling inside `packages/web/src/components/tarifarios/tarifario_calendar_day.tsx` so day cells never overlap or improperly break text in 1, 3, 6, or 12 month grids
- [X] T009 [P] [US3] Refine selected dates text wrapping and count badge layout in `packages/web/src/components/tarifarios/tarifario_period_summary.tsx` and `packages/web/src/components/tarifarios/tarifario_calendar.tsx` to prevent clipping or overlap across screen resolutions

**Checkpoint**: User Story 3 is functional and independently verified.

---

## Phase 6: User Story 4 - Funcionamento do Dropdown "Mais filtros" na Pesquisa de Tarifários e Remoção de Breadcrumbs (Priority: P2)

**Goal**: Disponibilizar e corrigir o dropdown "Mais filtros" na página de pesquisa de tarifários (`/tarifarios`) e remover completamente os links de navegação (breadcrumbs `Tarifários / Novo tarifário` e `Tarifários / Editar tarifário`) das páginas de inclusão e edição de tarifários.

**Independent Test**: Na página `/tarifarios`, clicar no botão "Mais filtros", verificar a abertura do menu com os filtros de categoria e situação e aplicar um filtro; nas páginas `/tarifarios/novo` e `/tarifarios/:id/editar`, verificar que o elemento `nav[aria-label="Breadcrumb"]` não existe.

### Implementation & Tests for User Story 4

- [X] T010 [P] [US4] Implement the "Mais filtros" dropdown (`Popover`, `PopoverTrigger`, `PopoverContent`) containing the category and status filters and a clear-filters action in `packages/web/src/pages/app/tarifarios/index.tsx`
- [X] T011 [P] [US4] Remove the breadcrumb navigation (`Tarifários / Novo tarifário` and `Tarifários / Editar tarifário`) from `packages/web/src/components/tarifarios/tarifario_form.tsx`
- [X] T012 [US4] Update page tests in `packages/web/src/pages/app/tarifarios/tarifarios_pages.spec.tsx` to verify opening and interacting with the "Mais filtros" dropdown on `TarifariosPage` and confirm the absence of breadcrumbs on `NovoTarifarioPage` and `EditarTarifarioPage`

**Checkpoint**: All 4 user stories are functional and independently verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final linting, formatting, full test execution, and production build validation.

- [X] T013 Run Biome check (`pnpm --filter web check`) and fix any formatting or lint issues in modified files under `packages/web/`
- [X] T014 Run the full test suite and production build (`pnpm --filter web test` and `pnpm --filter web build`) per `specs/016-calendar-usability-improvements/quickstart.md`
