import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@hotelmind/ui'
import { Link } from 'react-router-dom'
import {
  formatar_brl,
  formatar_data,
  formatar_diarias,
  formatar_pessoas,
} from '@/lib/reserva_format'
import type { Reservation } from '@/types/calendario_reserva'

const ORIGEM_DIRETA = 'Balcão / Reserva Direta'
const SEM_VALOR = '-'

interface ModalDetalhesReservaProps {
  open: boolean
  reservation: Reservation | null
  onOpenChange: (open: boolean) => void
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

export function ModalDetalhesReserva({
  open,
  reservation,
  onOpenChange,
}: ModalDetalhesReservaProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações completas sobre a hospedagem
          </DialogDescription>
        </DialogHeader>

        {reservation && (
          <div className="space-y-6 mt-4 text-sm">
            <section className="space-y-2">
              <h3 className="font-semibold text-lg">Reserva</h3>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Código">{reservation.codigo}</Campo>
                <Campo label="Status">{reservation.status_label}</Campo>
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
                <Campo label="Regime">
                  {reservation.regime_titulo ?? SEM_VALOR}
                </Campo>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg">Titular</h3>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Nome">{reservation.titular.nome}</Campo>
                <Campo label="E-mail">
                  {reservation.titular.email ?? SEM_VALOR}
                </Campo>
                <Campo label="Telefone">
                  {reservation.titular.telefone ?? SEM_VALOR}
                </Campo>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-lg">Comercial</h3>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Origem">
                  {reservation.parceiro_nome ?? ORIGEM_DIRETA}
                </Campo>
                <Campo label="Valor total">
                  {formatar_brl(reservation.valor_total)}
                </Campo>
                <Campo label="FNRH">
                  {`${reservation.fichas_preenchidas} de ${reservation.total_hospedes} fichas FNRH preenchidas`}
                </Campo>
              </div>
            </section>

            {reservation.observacoes && (
              <section className="space-y-2">
                <h3 className="font-semibold text-lg">Observações</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {reservation.observacoes}
                </p>
              </section>
            )}
          </div>
        )}

        <DialogFooter>
          {reservation && (
            <Button asChild variant="outline">
              <Link to={`/reservas/${reservation.id}`}>Abrir reserva</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
