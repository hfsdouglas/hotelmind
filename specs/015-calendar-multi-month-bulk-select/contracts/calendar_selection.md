# UI & Component Contract: Calendário Multi-Mês e Seleção em Massa

## 1. Funções Utilitárias (`packages/web/src/schemas/tarifario.schema.ts`)

```ts
export type CalendarMonthsViewCount = 1 | 3 | 6 | 12
export type CalendarBulkSelectMode = 'all' | 'weekdays' | 'weekends'

export interface VisibleCalendarMonth {
  year: number
  month_zero_based: number
  cells: CalendarMonthCell[]
}

export function get_visible_calendar_months(
  start_year: number,
  start_month_zero_based: number,
  count: CalendarMonthsViewCount,
): VisibleCalendarMonth[]

export function compute_bulk_selection_dates(input: {
  visible_months: Array<{ year: number; month_zero_based: number }>
  mode: CalendarBulkSelectMode
  occupied_periods: PeriodoTarifarioCalendario[]
  exclude_tarifario_id?: string
}): string[]
```

## 2. Contrato de Propriedades de `TarifarioCalendar` (`packages/web/src/components/tarifarios/tarifario_calendar.tsx`)

```ts
export interface TarifarioCalendarProps {
  selectedDates: string[]
  occupiedPeriods: PeriodoTarifarioCalendario[]
  excludeTarifarioId?: string
  initialMonth?: { year: number; month: number }
  initialMonthsCount?: CalendarMonthsViewCount
  onToggleDate: (isoDate: string) => void
  onReplaceSelection: (isoDates: string[]) => void
  onClearSelection: () => void
  onNavigateMonth?: (year: number, month: number) => void
}
```

## 3. Controles Interativos e Acessibilidade (`data-testid` / `aria-label`)

- **Seletor de quantidade de meses**:
  - Botões ou controle segmentado para `1 mês`, `3 meses`, `6 meses`, `12 meses` (`data-testid="calendar-view-1"`, `calendar-view-3`, `calendar-view-6`, `calendar-view-12`).
- **Ações de seleção em massa**:
  - Botão `Selecionar todos os dias` (`data-testid="bulk-select-all"`)
  - Botão `Selecionar dias da semana` (`data-testid="bulk-select-weekdays"`)
  - Botão `Selecionar fim de semana` (`data-testid="bulk-select-weekends"`)
- **Contador de datas selecionadas**:
  - Exibido tanto no resumo (`TarifarioPeriodSummary`) quanto no cabeçalho/barra de ações do calendário (`data-testid="calendar-selected-count"`).
