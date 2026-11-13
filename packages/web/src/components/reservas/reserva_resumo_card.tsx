import { formatar_camas } from '@/lib/camas'
import { rotulo_hospede } from '@/lib/fnrh'
import {
  formatar_brl,
  formatar_data,
  formatar_diarias,
  formatar_pessoas,
} from '@/lib/reserva_format'
import type { Reservation } from '@/types/calendario_reserva'

interface ReservaResumoCardProps {
  reservation: Reservation
}

function Linha({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

export function ReservaResumoCard({ reservation }: ReservaResumoCardProps) {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">{reservation.codigo}</span>
        <span className="rounded-full border px-2 py-0.5 text-[11px]">
          {reservation.status_label}
        </span>
      </div>
      <dl className="space-y-1">
        <Linha label="Titular">{reservation.titular.nome}</Linha>
        <Linha label="Hóspedes">
          <ul>
            {reservation.hospedes.map(h => (
              <li key={h.posicao}>{rotulo_hospede(h)}</li>
            ))}
          </ul>
        </Linha>
        <Linha label="Suíte">
          <span>{reservation.quarto_identificacao}</span>
          {' - '}
          <span>{reservation.categoria_nome}</span>
        </Linha>
        <Linha label="Camas">{formatar_camas(reservation.camas)}</Linha>
        <Linha label="Pessoas">{formatar_pessoas(reservation)}</Linha>
        {reservation.regime_titulo && (
          <Linha label="Regime">{reservation.regime_titulo}</Linha>
        )}
        <Linha label="Período">
          <span>{formatar_data(reservation.checkIn)}</span>
          {' - '}
          <span>{formatar_data(reservation.checkOut)}</span>
          {' ('}
          <span>{formatar_diarias(reservation.diarias)}</span>
          {')'}
        </Linha>
        <Linha label="Valor total">
          {formatar_brl(reservation.valor_total)}
        </Linha>
        {reservation.parceiro_nome && (
          <Linha label="Parceiro">{reservation.parceiro_nome}</Linha>
        )}
        <Linha label="FNRH">
          {`FNRH ${reservation.fichas_preenchidas} de ${reservation.total_hospedes} preenchidas`}
        </Linha>
        {reservation.observacoes && (
          <Linha label="Observações">
            <p className="line-clamp-6 whitespace-pre-wrap">
              {reservation.observacoes}
            </p>
          </Linha>
        )}
      </dl>
    </div>
  )
}
