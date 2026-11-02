import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  RotateCcw,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  find_conflicting_periods,
  format_iso_to_br,
  get_calendar_month_grid,
  is_day_in_half_open_period,
  is_day_in_inclusive_range,
  is_valid_date_string,
  to_inclusive_end_date,
} from '@/schemas/tarifario.schema'
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

export interface TarifarioCalendarProps {
  startDate: string
  endDate: string
  occupiedPeriods: PeriodoTarifarioCalendario[]
  excludeTarifarioId?: string
  initialMonth?: { year: number; month: number }
  onSelectRange: (startDate: string, endDate: string) => void
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
  startDate,
  endDate,
  occupiedPeriods,
  excludeTarifarioId,
  initialMonth,
  onSelectRange,
  onNavigateMonth,
}: TarifarioCalendarProps) {
  const [viewed_month, setViewedMonth] = useState<{
    year: number
    month: number
  }>(() => initialMonth ?? parse_year_month(startDate))
  const [inspected_period, setInspectedPeriod] =
    useState<PeriodoTarifarioCalendario | null>(null)

  useEffect(() => {
    if (startDate && is_valid_date_string(startDate)) {
      const [y, m] = startDate.split('-').map(Number)
      setViewedMonth(current => {
        if (current.year === y && current.month === m - 1) return current
        return { year: y, month: m - 1 }
      })
    }
  }, [startDate])

  const today_iso = new Date().toISOString().slice(0, 10)
  const cells = get_calendar_month_grid(viewed_month.year, viewed_month.month)

  const visible_occupied_periods = occupiedPeriods.filter(
    p => !excludeTarifarioId || p.id !== excludeTarifarioId,
  )

  const conflicting_periods =
    startDate && endDate
      ? find_conflicting_periods(
          startDate,
          endDate,
          occupiedPeriods,
          excludeTarifarioId,
        )
      : []

  function navigate_to(year: number, month: number) {
    const normalized = new Date(Date.UTC(year, month, 1))
    const next_state = {
      year: normalized.getUTCFullYear(),
      month: normalized.getUTCMonth(),
    }
    setViewedMonth(next_state)
    onNavigateMonth?.(next_state.year, next_state.month)
  }

  function handle_day_click(clicked_iso: string) {
    // 1st click or starting a fresh selection when both start and end were already defined
    if (!startDate || (startDate && endDate)) {
      onSelectRange(clicked_iso, '')
      return
    }

    // 2nd click: if clicked date is before startDate, restart selection with clicked date as startDate (Section 5.5)
    if (clicked_iso < startDate) {
      onSelectRange(clicked_iso, '')
      return
    }

    // Otherwise complete the range [startDate, clicked_iso]
    onSelectRange(startDate, clicked_iso)
  }

  function handle_clear() {
    onSelectRange('', '')
  }

  return (
    <div
      data-testid="tarifario-calendar"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3
            data-testid="calendar-month-title"
            className="text-base font-semibold"
          >
            {MONTH_NAMES[viewed_month.month]} de {viewed_month.year}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate_to(viewed_month.year, viewed_month.month - 1)
            }
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Mês anterior</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date()
              navigate_to(now.getFullYear(), now.getMonth())
            }}
            aria-label="Mês atual"
          >
            Mês atual
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate_to(viewed_month.year, viewed_month.month + 1)
            }
            aria-label="Próximo mês"
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Próximo mês</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {(startDate || endDate) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handle_clear}
              aria-label="Limpar seleção"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Limpar seleção
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted-foreground">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(cell => {
          const day_occupied = visible_occupied_periods.filter(period =>
            is_day_in_half_open_period(
              cell.iso_date,
              period.data_inicio,
              period.data_fim,
            ),
          )
          const is_start = Boolean(startDate && cell.iso_date === startDate)
          const is_end = Boolean(endDate && cell.iso_date === endDate)
          const is_middle = Boolean(
            startDate &&
              endDate &&
              cell.iso_date > startDate &&
              cell.iso_date < endDate,
          )
          const is_in_selected_range =
            is_start ||
            is_end ||
            (startDate &&
              endDate &&
              is_day_in_inclusive_range(cell.iso_date, startDate, endDate))
          const is_conflicting = Boolean(
            is_in_selected_range &&
              conflicting_periods.some(period =>
                is_day_in_half_open_period(
                  cell.iso_date,
                  period.data_inicio,
                  period.data_fim,
                ),
              ),
          )

          return (
            <TarifarioCalendarDay
              key={cell.iso_date}
              isoDate={cell.iso_date}
              dayNumber={cell.day_number}
              isCurrentMonth={cell.is_current_month}
              isToday={cell.iso_date === today_iso}
              isSelectedStart={is_start}
              isSelectedEnd={is_end}
              isSelectedMiddle={is_middle}
              isConflicting={is_conflicting}
              occupiedPeriods={day_occupied}
              onSelectDay={handle_day_click}
              onInspectPeriod={period => setInspectedPeriod(period)}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-border bg-background" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary/20">
            <Check className="h-2.5 w-2.5 text-primary" />
          </span>
          <span>Início / Fim selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-primary/60 bg-primary/10" />
          <span>Dias intermediários</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-amber-500/70 bg-amber-500/15">
            <Lock className="h-2.5 w-2.5 text-amber-600" />
          </span>
          <span>Período ocupado (clique para consultar)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded border-2 border-dashed border-destructive bg-destructive/15">
            <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
          </span>
          <span>Conflito de período</span>
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
            </div>
            <span className="text-xs text-muted-foreground">
              Vigência efetiva: {format_iso_to_br(inspected_period.data_inicio)}{' '}
              até{' '}
              {format_iso_to_br(
                to_inclusive_end_date(inspected_period.data_fim),
              )}
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
