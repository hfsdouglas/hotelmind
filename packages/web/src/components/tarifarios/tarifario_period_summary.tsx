import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { AlertTriangle, CalendarCheck2, Info } from 'lucide-react'
import {
  count_effective_nights,
  format_iso_to_br,
  to_inclusive_end_date,
} from '@/schemas/tarifario.schema'

interface TarifarioPeriodSummaryProps {
  startDate: string
  endDate: string
  valorDiaria?: string
  conflictingPeriods: PeriodoTarifarioCalendario[]
}

export function TarifarioPeriodSummary({
  startDate,
  endDate,
  valorDiaria,
  conflictingPeriods,
}: TarifarioPeriodSummaryProps) {
  const nights = count_effective_nights(startDate, endDate)
  const has_conflict = conflictingPeriods.length > 0

  if (!startDate && !endDate) {
    return (
      <div
        data-testid="period-summary-empty"
        className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground"
      >
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Selecione a data inicial e a data final no calendário ou nos campos do
          formulário para definir o período de vigência.
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
        <div className="flex items-center gap-2">
          <CalendarCheck2
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <span className="font-medium">Período selecionado: </span>
            <span>
              {format_iso_to_br(startDate)}
              {endDate
                ? ` até ${format_iso_to_br(endDate)} (${nights} ${nights === 1 ? 'diária' : 'diárias'})`
                : ' (selecione a data de término no calendário)'}
            </span>
          </div>
        </div>
        {valorDiaria && Number(valorDiaria.replace(',', '.')) >= 0 && (
          <span className="font-semibold text-foreground">
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
            <span className="font-semibold">
              Conflito de período identificado
            </span>
            <span>
              O intervalo selecionado sobrepõe{' '}
              {conflictingPeriods
                .map(
                  p =>
                    `"${p.nome}" (${format_iso_to_br(p.data_inicio)} até ${format_iso_to_br(to_inclusive_end_date(p.data_fim))})`,
                )
                .join(', ')}
              . Ajuste as datas antes de salvar.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
