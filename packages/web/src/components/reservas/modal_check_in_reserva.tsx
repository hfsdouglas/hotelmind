import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  fichas_pendentes,
  rotulo_ficha_status,
  rotulo_hospede,
} from '@/lib/fnrh'
import {
  formatar_brl,
  formatar_data,
  formatar_diarias,
  formatar_pessoas,
} from '@/lib/reserva_format'
import { is_check_in_antecipado } from '@/lib/reserva_status'
import type { OpcaoCheckIn, Reservation } from '@/types/calendario_reserva'

interface ModalCheckInReservaProps {
  open: boolean
  reservation: Reservation | null
  hoje: Date
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirmar: (opcao: OpcaoCheckIn) => void
}

function Campo({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium">{children}</p>
    </div>
  )
}

export function ModalCheckInReserva({
  open,
  reservation,
  hoje,
  isPending,
  onOpenChange,
  onConfirmar,
}: ModalCheckInReservaProps) {
  const pendentes = reservation ? fichas_pendentes(reservation.hospedes) : []
  const tem_pendencias = pendentes.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar check-in</DialogTitle>
          <DialogDescription>
            Revise os dados da reserva antes de confirmar a entrada.
          </DialogDescription>
        </DialogHeader>

        {reservation && (
          <div className="space-y-4 text-sm">
            {is_check_in_antecipado(reservation.checkIn, hoje) && (
              <p
                role="alert"
                className="rounded-md border border-status-checkin/40 bg-status-checkin/10 p-2 text-status-checkin-foreground"
              >
                {`Check-in antecipado: a entrada prevista é ${formatar_data(reservation.checkIn)}`}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Campo label="Reserva">{reservation.codigo}</Campo>
              <Campo label="Titular">{reservation.titular.nome}</Campo>
              <Campo label="Suíte">
                <span>{reservation.quarto_identificacao}</span>
                {' - '}
                <span>{reservation.categoria_nome}</span>
              </Campo>
              <Campo label="Período">
                <span>{formatar_data(reservation.checkIn)}</span>
                {' - '}
                <span>{formatar_data(reservation.checkOut)}</span>
                {' ('}
                <span>{formatar_diarias(reservation.diarias)}</span>
                {')'}
              </Campo>
              <Campo label="Pessoas">{formatar_pessoas(reservation)}</Campo>
              {reservation.regime_titulo && (
                <Campo label="Regime">{reservation.regime_titulo}</Campo>
              )}
              {reservation.parceiro_nome && (
                <Campo label="Parceiro">{reservation.parceiro_nome}</Campo>
              )}
              <Campo label="Valor total">
                {formatar_brl(reservation.valor_total)}
              </Campo>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold">Observações</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {reservation.observacoes || 'Sem observações'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">FNRH</h3>
              {reservation.total_hospedes === 0 ? (
                <p>Nenhuma ficha FNRH cadastrada</p>
              ) : (
                <p>{`${reservation.fichas_preenchidas} de ${reservation.total_hospedes} fichas FNRH preenchidas`}</p>
              )}
              {tem_pendencias && (
                <div className="space-y-1">
                  <p className="font-medium">
                    {`${pendentes.length} ${pendentes.length === 1 ? 'ficha FNRH pendente' : 'fichas FNRH pendentes'}`}
                  </p>
                  <ul className="list-disc pl-5">
                    {pendentes.map(h => (
                      <li key={h.posicao}>
                        {`${rotulo_hospede(h)} - ${rotulo_ficha_status(h.ficha_status)}`}
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground">
                    O preenchimento é opcional.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {tem_pendencias ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onConfirmar('sem_preencher')}
              >
                Fazer check-in sem preencher
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => onConfirmar('preencher_fnrh')}
              >
                Fazer check-in e preencher FNRHs
              </Button>
            </>
          ) : (
            <Button
              type="button"
              disabled={isPending}
              onClick={() => onConfirmar('confirmar')}
            >
              Confirmar check-in
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
