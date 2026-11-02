import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { AlertTriangle, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TarifarioCalendarDayProps {
  isoDate: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelectedStart: boolean
  isSelectedEnd: boolean
  isSelectedMiddle: boolean
  isConflicting: boolean
  occupiedPeriods: PeriodoTarifarioCalendario[]
  onSelectDay: (isoDate: string) => void
  onInspectPeriod?: (period: PeriodoTarifarioCalendario) => void
}

export function TarifarioCalendarDay({
  isoDate,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelectedStart,
  isSelectedEnd,
  isSelectedMiddle,
  isConflicting,
  occupiedPeriods,
  onSelectDay,
  onInspectPeriod,
}: TarifarioCalendarDayProps) {
  const active_occupied = occupiedPeriods.find(p => p.ativo)
  const primary_occupied = active_occupied ?? occupiedPeriods[0]
  const is_selected = isSelectedStart || isSelectedEnd || isSelectedMiddle

  const state_labels: string[] = [`Dia ${isoDate}`]
  if (isToday) state_labels.push('Hoje')
  if (isSelectedStart && isSelectedEnd) state_labels.push('Início e Fim')
  else if (isSelectedStart) state_labels.push('Data inicial selecionada')
  else if (isSelectedEnd) state_labels.push('Data final selecionada')
  else if (isSelectedMiddle) state_labels.push('Dia intermediário selecionado')
  if (isConflicting) state_labels.push('Período conflitante')
  else if (primary_occupied) {
    state_labels.push(
      `Ocupado por ${primary_occupied.nome} (R$ ${primary_occupied.valor_diaria})`,
    )
  } else {
    state_labels.push('Disponível')
  }

  return (
    <div
      data-testid={`calendar-day-cell-${isoDate}`}
      data-selected={is_selected ? 'true' : 'false'}
      data-occupied={primary_occupied ? 'true' : 'false'}
      data-conflict={isConflicting ? 'true' : 'false'}
      className={cn(
        'relative flex min-h-[76px] flex-col justify-between rounded-md border p-1.5 text-left transition-colors',
        !isCurrentMonth && 'opacity-45',
        !is_selected && !primary_occupied && 'border-border bg-background hover:bg-accent/50',
        primary_occupied &&
          !is_selected &&
          (primary_occupied.ativo
            ? 'border-amber-500/70 bg-amber-500/10'
            : 'border-dashed border-muted-foreground/40 bg-muted/30'),
        isSelectedMiddle &&
          !isConflicting &&
          'border-primary/60 bg-primary/10',
        (isSelectedStart || isSelectedEnd) &&
          !isConflicting &&
          'border-2 border-primary bg-primary/20 ring-1 ring-primary',
        isConflicting &&
          'border-2 border-dashed border-destructive bg-destructive/15 ring-1 ring-destructive',
      )}
    >
      <button
        type="button"
        data-testid={`calendar-day-${isoDate}`}
        aria-label={state_labels.join(' - ')}
        aria-pressed={is_selected}
        onClick={() => onSelectDay(isoDate)}
        className="flex w-full flex-1 flex-col justify-between text-left focus:outline-none"
      >
        <div className="flex w-full items-center justify-between gap-1">
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              isToday && 'border border-foreground font-bold underline',
              (isSelectedStart || isSelectedEnd) &&
                !isConflicting &&
                'bg-primary text-primary-foreground',
              isConflicting && 'bg-destructive text-destructive-foreground',
            )}
          >
            {dayNumber}
          </span>

          <div className="flex items-center gap-0.5">
            {isToday && (
              <span className="rounded bg-secondary px-1 text-[10px] font-medium">
                Hoje
              </span>
            )}
            {isConflicting && (
              <AlertTriangle
                className="h-3.5 w-3.5 text-destructive"
                aria-hidden="true"
              />
            )}
            {!isConflicting && (isSelectedStart || isSelectedEnd) && (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            )}
            {!isConflicting && primary_occupied && (
              <Lock
                className="h-3 w-3 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-0.5">
          {isSelectedStart && isSelectedEnd && (
            <span className="text-[10px] font-semibold text-primary">
              Início/Fim
            </span>
          )}
          {isSelectedStart && !isSelectedEnd && (
            <span className="text-[10px] font-semibold text-primary">
              Início
            </span>
          )}
          {isSelectedEnd && !isSelectedStart && (
            <span className="text-[10px] font-semibold text-primary">Fim</span>
          )}
          {isSelectedMiddle && (
            <span className="text-[10px] font-medium text-primary/90">
              No período
            </span>
          )}
          {isConflicting && (
            <span className="text-[10px] font-semibold text-destructive">
              Conflito
            </span>
          )}
        </div>
      </button>

      {primary_occupied && (
        <button
          type="button"
          data-testid={`calendar-occupied-info-${isoDate}`}
          onClick={event => {
            event.stopPropagation()
            onInspectPeriod?.(primary_occupied)
          }}
          className="mt-1 flex w-full items-center justify-between truncate rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-medium text-foreground hover:bg-amber-500/30"
          title={`Consultar tarifário: ${primary_occupied.nome} (R$ ${primary_occupied.valor_diaria})`}
        >
          <span className="truncate">{primary_occupied.nome}</span>
          <span className="ml-1 shrink-0">R${primary_occupied.valor_diaria}</span>
        </button>
      )}
    </div>
  )
}
