import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { AlertTriangle, CalendarCheck2, Info } from 'lucide-react'
import { format_dates_summary } from '@/schemas/tarifario.schema'

interface TarifarioPeriodSummaryProps {
  selectedDates: string[]
  valorDiaria?: string
  conflictingPeriods: PeriodoTarifarioCalendario[]
}

export function TarifarioPeriodSummary({
  selectedDates,
  valorDiaria,
  conflictingPeriods,
}: TarifarioPeriodSummaryProps) {
  const count = selectedDates.length
  const has_conflict = conflictingPeriods.length > 0

  if (count === 0) {
    return (
      <div
        data-testid="period-summary-empty"
        className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground"
      >
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Marque no calendário uma ou mais datas em que este valor de diária
          será aplicado.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="period-summary-selected"
        className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 p-3 text-sm"
      >
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
          <CalendarCheck2
            className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 break-words leading-relaxed">
            <span className="font-medium">
              {count} {count === 1 ? 'data marcada' : 'datas marcadas'}:{' '}
            </span>
            <span className="text-muted-foreground">
              {format_dates_summary(selectedDates, 5)}
            </span>
          </div>
        </div>
        {valorDiaria && Number(valorDiaria.replace(',', '.')) >= 0 && (
          <span className="shrink-0 whitespace-nowrap font-semibold text-foreground">
            Diária: R$ {Number(valorDiaria.replace(',', '.')).toFixed(2)}
          </span>
        )}
      </div>

      {has_conflict && (
        <div
          role="alert"
          data-testid="period-conflict-alert"
          className="flex items-start gap-2 rounded-md border-2 border-dashed border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Conflito de data identificado</span>
            <span>
              Uma ou mais datas selecionadas já pertencem a{' '}
              {conflictingPeriods.map(p => `"${p.nome}"`).join(', ')}. Desmarque
              as datas em conflito antes de salvar.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
