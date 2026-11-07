import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Lock,
  RotateCcw,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  type CalendarBulkSelectMode,
  type CalendarMonthsViewCount,
  compute_bulk_selection_dates,
  find_conflicting_periods,
  format_dates_summary,
  get_local_today_iso,
  get_visible_calendar_months,
  is_valid_date_string,
} from '@/schemas/tarifarios/tarifario_schema'
import { TarifarioCalendarDay } from './tarifario_calendar_day'
import { TarifarioStatusBadge } from './tarifario_status_badge'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const MONTH_SHORT_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const VIEW_COUNT_OPTIONS: Array<{
  count: CalendarMonthsViewCount
  label: string
}> = [
  { count: 1, label: '1 mês' },
  { count: 3, label: '3 meses' },
  { count: 6, label: '6 meses' },
  { count: 12, label: '12 meses' },
]

export interface TarifarioCalendarProps {
  selectedDates: string[]
  occupiedPeriods: PeriodoTarifarioCalendario[]
  excludeTarifarioId?: string
  initialMonth?: { year: number; month: number }
  initialMonthsCount?: CalendarMonthsViewCount
  onToggleDate: (isoDate: string) => void
  onReplaceSelection?: (isoDates: string[]) => void
  onClearSelection: () => void
  onNavigateMonth?: (year: number, month: number) => void
}

function parse_year_month(iso_date?: string): { year: number; month: number } {
  if (iso_date && is_valid_date_string(iso_date)) {
    const [y, m] = iso_date.split('-').map(Number)
    return { year: y, month: m - 1 }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

export function TarifarioCalendar({
  selectedDates,
  occupiedPeriods,
  excludeTarifarioId,
  initialMonth,
  initialMonthsCount = 1,
  onToggleDate,
  onReplaceSelection,
  onClearSelection,
  onNavigateMonth,
}: TarifarioCalendarProps) {
  const [viewed_month, setViewedMonth] = useState<{
    year: number
    month: number
  }>(() => {
    if (initialMonth) return initialMonth
    if (selectedDates.length >= 200 && selectedDates[0]) {
      const [y] = selectedDates[0].split('-').map(Number)
      return { year: y, month: 0 }
    }
    return parse_year_month(selectedDates[0])
  })
  const [months_count, setMonthsCount] = useState<CalendarMonthsViewCount>(
    () => {
      if (selectedDates.length >= 200) return 12
      return initialMonthsCount
    }
  )
  const [datepicker_open, setDatepickerOpen] = useState(false)
  const [inspected_period, setInspectedPeriod] =
    useState<PeriodoTarifarioCalendario | null>(null)

  const today_iso = get_local_today_iso()
  const visible_months = get_visible_calendar_months(
    viewed_month.year,
    viewed_month.month,
    months_count
  )
  const selected_set = new Set(selectedDates)

  const visible_occupied_periods = occupiedPeriods.filter(
    p => !excludeTarifarioId || p.id !== excludeTarifarioId
  )

  const conflicting_periods = find_conflicting_periods(
    selectedDates,
    occupiedPeriods,
    excludeTarifarioId
  )

  function navigate_to(year: number, month: number) {
    const normalized = new Date(Date.UTC(year, month, 1))
    const next_state = {
      year: normalized.getUTCFullYear(),
      month: normalized.getUTCMonth(),
    }
    setViewedMonth(next_state)
    onNavigateMonth?.(next_state.year, next_state.month)
  }

  function handle_bulk_select(mode: CalendarBulkSelectMode) {
    const next_dates = compute_bulk_selection_dates({
      visible_months: visible_months.map(m => ({
        year: m.year,
        month_zero_based: m.month_zero_based,
      })),
      mode,
      occupied_periods: occupiedPeriods,
      exclude_tarifario_id: excludeTarifarioId,
    })
    onReplaceSelection?.(next_dates)
  }

  const current_year = new Date().getFullYear()
  const min_year = Math.min(current_year - 5, viewed_month.year - 2)
  const max_year = Math.max(current_year + 10, viewed_month.year + 5)
  const available_years: number[] = []
  for (let y = min_year; y <= max_year; y++) {
    available_years.push(y)
  }

  const first_visible = visible_months[0]
  const last_visible = visible_months[visible_months.length - 1]
  const header_title =
    months_count === 1
      ? `${MONTH_NAMES[first_visible.month_zero_based]} de ${first_visible.year}`
      : `${MONTH_NAMES[first_visible.month_zero_based]} de ${first_visible.year} — ${MONTH_NAMES[last_visible.month_zero_based]} de ${last_visible.year}`

  return (
    <div
      data-testid="tarifario-calendar"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
    >
      {/* Top toolbar: Title, View Mode (1, 3, 6, 12 months), and Period Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <CalendarIcon
            className="h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <h3
            data-testid="calendar-month-title"
            className="min-w-0 break-words text-base font-semibold"
          >
            {header_title}
          </h3>
          <span
            data-testid="calendar-selected-count"
            className="shrink-0 whitespace-nowrap rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            {selectedDates.length}{' '}
            {selectedDates.length === 1
              ? 'data selecionada'
              : 'datas selecionadas'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* biome-ignore lint/a11y/useSemanticElements: toolbar group */}
          <div
            role="group"
            aria-label="Quantidade de meses exibidos"
            className="inline-flex items-center rounded-md border bg-muted/40 p-0.5"
          >
            {VIEW_COUNT_OPTIONS.map(option => {
              const active = months_count === option.count
              return (
                <Button
                  key={option.count}
                  type="button"
                  size="sm"
                  variant={active ? 'default' : 'ghost'}
                  data-testid={`calendar-view-${option.count}`}
                  aria-pressed={active}
                  onClick={() => setMonthsCount(option.count)}
                  className="h-7 px-2.5 text-xs"
                >
                  {option.label}
                </Button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="calendar-prev-period"
              onClick={() =>
                navigate_to(
                  viewed_month.year,
                  viewed_month.month - months_count
                )
              }
              aria-label="Período anterior"
              className="h-8 w-8 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={datepicker_open} onOpenChange={setDatepickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="calendar-datepicker-trigger"
                  aria-label="Selecionar mês e ano"
                  className="h-8 justify-start gap-2 px-3 text-xs font-medium"
                >
                  <CalendarIcon
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>
                    {MONTH_NAMES[viewed_month.month]} de {viewed_month.year}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                data-testid="calendar-datepicker-popover"
                className="w-[280px] p-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[1fr_100px] gap-2">
                    <Select
                      value={String(viewed_month.month)}
                      onValueChange={val =>
                        navigate_to(viewed_month.year, Number(val))
                      }
                    >
                      <SelectTrigger
                        data-testid="calendar-select-month"
                        aria-label="Selecionar mês"
                        className="h-8 text-xs"
                      >
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES.map((month_name, index) => (
                          <SelectItem
                            key={month_name}
                            value={String(index)}
                            className="text-xs"
                          >
                            {month_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={String(viewed_month.year)}
                      onValueChange={val =>
                        navigate_to(Number(val), viewed_month.month)
                      }
                    >
                      <SelectTrigger
                        data-testid="calendar-select-year"
                        aria-label="Selecionar ano"
                        className="h-8 text-xs"
                      >
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {available_years.map(year => (
                          <SelectItem
                            key={year}
                            value={String(year)}
                            className="text-xs"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* biome-ignore lint/a11y/useSemanticElements: month grid group */}
                  <div
                    role="group"
                    aria-label="Grade de meses"
                    className="grid grid-cols-3 gap-1.5"
                  >
                    {MONTH_SHORT_NAMES.map((short_name, index) => {
                      const is_active_month = viewed_month.month === index
                      return (
                        <Button
                          key={short_name}
                          type="button"
                          size="sm"
                          variant={is_active_month ? 'default' : 'ghost'}
                          data-testid={`calendar-picker-month-${index}`}
                          aria-label={MONTH_NAMES[index]}
                          aria-pressed={is_active_month}
                          onClick={() => {
                            navigate_to(viewed_month.year, index)
                            setDatepickerOpen(false)
                          }}
                          className="h-8 text-xs"
                        >
                          {short_name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="calendar-next-period"
              onClick={() =>
                navigate_to(
                  viewed_month.year,
                  viewed_month.month + months_count
                )
              }
              aria-label="Próximo período"
              className="h-8 w-8 shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk selection actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Seleção rápida nos meses visíveis:
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-testid="bulk-select-all"
            onClick={() => handle_bulk_select('all')}
            className="h-7 text-xs"
          >
            Selecionar todos os dias
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-testid="bulk-select-weekdays"
            onClick={() => handle_bulk_select('weekdays')}
            className="h-7 text-xs"
          >
            Selecionar dias da semana
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-testid="bulk-select-weekends"
            onClick={() => handle_bulk_select('weekends')}
            className="h-7 text-xs"
          >
            Selecionar fim de semana
          </Button>
        </div>

        {selectedDates.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            aria-label="Limpar seleção"
            className="h-7 text-xs"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Limpar seleção
          </Button>
        )}
      </div>

      {/* Responsive multi-month grid */}
      <div
        data-testid="calendar-months-grid"
        className={cn(
          'grid gap-4',
          months_count === 1
            ? 'grid-cols-1'
            : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        )}
      >
        {visible_months.map(month_block => {
          const month_key = `${month_block.year}-${String(month_block.month_zero_based + 1).padStart(2, '0')}`
          return (
            <div
              key={month_key}
              data-testid={`calendar-month-block-${month_key}`}
              className={cn(
                'flex flex-col gap-2',
                months_count > 1 && 'rounded-md border bg-background/60 p-3'
              )}
            >
              {months_count > 1 && (
                <h4 className="text-center text-sm font-semibold">
                  {MONTH_NAMES[month_block.month_zero_based]} de{' '}
                  {month_block.year}
                </h4>
              )}

              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted-foreground">
                {WEEKDAYS.map(day => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {month_block.cells.map(cell => {
                  const day_occupied = visible_occupied_periods.filter(period =>
                    period.datas.includes(cell.iso_date)
                  )
                  const is_selected = selected_set.has(cell.iso_date)
                  const is_conflicting = Boolean(
                    is_selected &&
                      conflicting_periods.some(period =>
                        period.datas.includes(cell.iso_date)
                      )
                  )

                  return (
                    <TarifarioCalendarDay
                      key={`${month_key}-${cell.iso_date}`}
                      isoDate={cell.iso_date}
                      dayNumber={cell.day_number}
                      isCurrentMonth={cell.is_current_month}
                      isToday={cell.iso_date === today_iso}
                      isSelected={is_selected}
                      isConflicting={is_conflicting}
                      occupiedPeriods={day_occupied}
                      onToggleDay={onToggleDate}
                      onInspectPeriod={period => setInspectedPeriod(period)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-border bg-background" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground">
            <Check className="h-2.5 w-2.5" />
          </span>
          <span>Data marcada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-amber-500/70 bg-amber-500/15">
            <Lock className="h-2.5 w-2.5 text-amber-600" />
          </span>
          <span>Data ocupada (clique na faixa para consultar)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border-2 border-dashed border-destructive bg-destructive/15">
            <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
          </span>
          <span>Conflito de data</span>
        </div>
      </div>

      {inspected_period && (
        <div
          data-testid="calendar-inspected-period"
          className="flex items-start justify-between gap-4 rounded-md border bg-muted/50 p-3 text-sm"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{inspected_period.nome}</span>
              <TarifarioStatusBadge ativo={inspected_period.ativo} />
              {inspected_period.parceiro_id ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Parceiro Comercial
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Público
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Datas: {format_dates_summary(inspected_period.datas, 6)}
            </span>
            <span className="text-xs font-medium">
              Valor da diária: R$ {inspected_period.valor_diaria}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setInspectedPeriod(null)}
            aria-label="Fechar detalhes do período"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
