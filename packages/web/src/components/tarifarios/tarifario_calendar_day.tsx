import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { AlertTriangle, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TarifarioCalendarDayProps {
  isoDate: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isConflicting: boolean
  occupiedPeriods: PeriodoTarifarioCalendario[]
  onToggleDay: (isoDate: string) => void
  onInspectPeriod?: (period: PeriodoTarifarioCalendario) => void
}

export function TarifarioCalendarDay({
  isoDate,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  isConflicting,
  occupiedPeriods,
  onToggleDay,
  onInspectPeriod,
}: TarifarioCalendarDayProps) {
  const active_occupied = occupiedPeriods.find(p => p.ativo)
  const primary_occupied = active_occupied ?? occupiedPeriods[0]

  const state_labels: string[] = [`Dia ${isoDate}`]
  if (isToday) state_labels.push('Hoje')
  if (isSelected) state_labels.push('Data marcada')
  if (isConflicting) state_labels.push('Data em conflito')
  else if (primary_occupied) {
    state_labels.push(
      `Ocupado por ${primary_occupied.nome} (R$ ${primary_occupied.valor_diaria})`
    )
  } else {
    state_labels.push('Disponível')
  }

  return (
    <div
      data-testid={`calendar-day-cell-${isoDate}`}
      data-selected={isSelected ? 'true' : 'false'}
      data-occupied={primary_occupied ? 'true' : 'false'}
      data-conflict={isConflicting ? 'true' : 'false'}
      className={cn(
        'relative flex min-h-[72px] min-w-0 flex-col justify-between overflow-hidden rounded-md border p-1.5 text-left transition-colors',
        !isCurrentMonth && 'opacity-45',
        !isSelected &&
          !primary_occupied &&
          'border-border bg-background hover:bg-accent/50',
        primary_occupied &&
          !isSelected &&
          (primary_occupied.ativo
            ? 'border-amber-500/70 bg-amber-500/10'
            : 'border-dashed border-muted-foreground/40 bg-muted/30'),
        isSelected &&
          !isConflicting &&
          'border-2 border-primary bg-primary/15 ring-1 ring-primary',
        isConflicting &&
          'border-2 border-dashed border-destructive bg-destructive/15 ring-1 ring-destructive'
      )}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: interactive calendar date button */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        data-testid={`calendar-day-${isoDate}`}
        aria-label={state_labels.join(' - ')}
        onClick={() => onToggleDay(isoDate)}
        className="flex w-full min-w-0 flex-1 flex-col justify-between gap-1 text-left focus:outline-none"
      >
        <div className="flex w-full min-w-0 items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <span
              className={cn(
                'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                isSelected &&
                  !isConflicting &&
                  'border-primary bg-primary text-primary-foreground',
                isConflicting &&
                  'border-destructive bg-destructive text-destructive-foreground',
                !isSelected && 'border-muted-foreground/50 bg-background'
              )}
              aria-hidden="true"
            >
              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
            </span>
            <span
              className={cn(
                ' shrink-0 text-xs font-semibold leading-none',
                isToday && 'underline font-bold'
              )}
            >
              {dayNumber}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {isToday && (
              <span className="rounded bg-secondary px-1 text-[10px] leading-tight font-medium">
                Hoje
              </span>
            )}
            {isConflicting && (
              <AlertTriangle
                className="h-3.5 w-3.5 shrink-0 text-destructive"
                aria-hidden="true"
              />
            )}
            {!isConflicting && primary_occupied && (
              <Lock
                className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        <div className="mt-0.5 flex min-w-0 flex-col">
          {isSelected && !isConflicting && (
            <span
              title="Selecionado"
              className="block w-full truncate text-[10px] leading-tight font-semibold text-primary"
            >
              Selecionado
            </span>
          )}
          {isConflicting && (
            <span
              title="Conflito"
              className="block w-full truncate text-[10px] leading-tight font-semibold text-destructive"
            >
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
          <span className="ml-1 shrink-0">
            R${primary_occupied.valor_diaria}
          </span>
        </button>
      )}
    </div>
  )
}
