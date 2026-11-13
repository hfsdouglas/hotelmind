import { Button } from '@hotelmind/ui'
import { BellRing, CalendarPlus, Info } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { avaliar_check_in } from '@/lib/reserva_status'
import type { Reservation } from '@/types/calendario_reserva'

const MOTIVO_DETALHES_SEM_SELECAO = 'Selecione uma reserva para ver os detalhes'

interface CalendarioBarraAcoesProps {
  reservaSelecionada: Reservation | null
  onNovaReserva: () => void
  onCheckIn: () => void
  onDetalhes: () => void
  containerRef?: Ref<HTMLDivElement>
}

interface AcaoProps {
  label: string
  icon: ReactNode
  onClick: () => void
  disabledReason?: string
}

function Acao({ label, icon, onClick, disabledReason }: AcaoProps) {
  const disabled = disabledReason !== undefined
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={disabled ? 0 : undefined}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={disabled}
            onClick={onClick}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{disabledReason ?? label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function CalendarioBarraAcoes({
  reservaSelecionada,
  onNovaReserva,
  onCheckIn,
  onDetalhes,
  containerRef,
}: CalendarioBarraAcoesProps) {
  const avaliacao = avaliar_check_in(reservaSelecionada)

  return (
    <div
      ref={containerRef}
      className="border-t bg-background shrink-0 px-4 py-2 flex items-center gap-2 justify-start"
    >
      <TooltipProvider>
        <Acao
          label="Nova Reserva"
          icon={<CalendarPlus className="h-4 w-4" />}
          onClick={onNovaReserva}
        />
        <Acao
          label="Check-in"
          icon={<BellRing className="h-4 w-4" />}
          onClick={onCheckIn}
          disabledReason={avaliacao.permitido ? undefined : avaliacao.motivo}
        />
        <Acao
          label="Detalhes"
          icon={<Info className="h-4 w-4" />}
          onClick={onDetalhes}
          disabledReason={
            reservaSelecionada ? undefined : MOTIVO_DETALHES_SEM_SELECAO
          }
        />
      </TooltipProvider>
    </div>
  )
}
