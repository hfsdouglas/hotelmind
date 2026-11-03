# Implementation Plan: Melhorias na Visualização e Seleção de Datas do Calendário de Tarifários

**Branch**: `015-calendar-multi-month-bulk-select` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-calendar-multi-month-bulk-select/spec.md`

## Summary

Aprimorar o calendário de tarifários (`packages/web`) para suportar visualização simultânea de `1`, `3`, `6` ou `12` meses consecutivos (com padrão `1 mês` e navegação proporcional à janela selecionada) e ações rápidas de seleção em massa (`Selecionar todos os dias`, `Selecionar dias da semana`, `Selecionar fim de semana`) operando exclusivamente sobre os dias disponíveis dos meses visíveis, substituindo a seleção atual, mantendo o ajuste individual estilo checkbox e atualizando automaticamente a contagem total de datas selecionadas sem alterar valores já digitados nem salvar automaticamente.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js >= 20)

**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Lucide React, Zod, Vitest + Testing Library

**Storage**: N/A (opera sobre o contrato `datas: string[]` já persistido pela API de tarifários em PostgreSQL)

**Testing**: Vitest + React Testing Library (`packages/web`)

**Target Platform**: Aplicação Web moderna (Desktop e Mobile responsivo)

**Project Type**: Monorepo web application (`packages/web`)

**Performance Goals**: Alternância instantânea (< 50ms) entre 1, 3, 6 e 12 meses (até 365 células de calendário) e execução imediata das seleções em massa em memória

**Constraints**: Preservação estrita da seleção ao trocar visualização ou navegar períodos; seleção em massa restrita exclusivamente aos meses visíveis (`is_current_month === true`) e datas disponíveis; nomenclatura `snake_case`

**Scale/Scope**: Aprimoramento de `tarifario.schema.ts`, `tarifario_calendar.tsx`, `tarifario_form.tsx`, `tarifario_period_summary.tsx` e respectivas suítes de testes em `packages/web`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Contract-First Development**: ✅ Aprovado — Utiliza os contratos `Tarifario` e `PeriodoTarifarioCalendario` (`datas: string[]`) já definidos em `packages/.contracts/src/tarifarios.ts`.
- **II. Clean Architecture & Strict Layer Boundaries**: ✅ Aprovado — Cálculos de grade multi-mês e filtragem de seleção em massa ficam isolados em funções puras em `packages/web/src/schemas/tarifario.schema.ts`, desacoplados da renderização React.
- **III. SOLID Principles**: ✅ Aprovado — `TarifarioCalendar` gerencia a janela de meses e delega cada célula a `TarifarioCalendarDay` e os cálculos de datas às funções utilitárias puras.
- **IV. Explicit over Implicit**: ✅ Aprovado — `onToggleDate`, `onReplaceSelection` e `onClearSelection` tornam explícito cada tipo de mutação de seleção sem efeitos colaterais ocultos.
- **V. Low Coupling, High Cohesion**: ✅ Aprovado — O formulário controla o estado `datas: string[]` e o valor da diária de forma independente.
- **VI. Clean Code (`snake_case`)**: ✅ Aprovado — Todos os arquivos, funções e identificadores seguem `snake_case`.
- **VII. Testability by Design**: ✅ Aprovado — Funções puras de geração de múltiplos meses e seleção em massa testáveis unitariamente e interações de UI testáveis via Testing Library.

## Project Structure

### Documentation (this feature)

```text
specs/015-calendar-multi-month-bulk-select/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Decisões técnicas da Fase 0
├── data-model.md        # Modelo de estado e invariantes da Fase 1
├── quickstart.md        # Guia de validação rápida da Fase 1
├── contracts/
│   └── calendar_selection.md
└── tasks.md             # Lista de tarefas (/speckit-tasks)
```

### Source Code (repository root)

```text
packages/
├── .contracts/
│   └── src/
│       └── tarifarios.ts
└── web/
    └── src/
        ├── schemas/
        │   ├── tarifario.schema.ts
        │   └── tarifario.schema.spec.ts
        └── components/
            └── tarifarios/
                ├── tarifario_calendar.tsx
                ├── tarifario_calendar_day.tsx
                ├── tarifario_period_summary.tsx
                ├── tarifario_form.tsx
                └── tarifario_calendar.spec.tsx
```

**Structure Decision**: As melhorias concentram-se no pacote `packages/web`, expandindo as funções puras de calendário em `packages/web/src/schemas/tarifario.schema.ts` e os componentes `tarifario_calendar.tsx`, `tarifario_form.tsx` e `tarifario_period_summary.tsx`.

## Complexity Tracking

Nenhuma violação à Constituição do projeto.
