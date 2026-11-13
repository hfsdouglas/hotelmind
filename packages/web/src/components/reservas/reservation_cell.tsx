import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hotelmind/ui'
import { isSameDay } from 'date-fns'
import { ReservaResumoCard } from '@/components/reservas/reserva_resumo_card'
import { cn } from '@/lib/utils'
import type { Reservation } from '@/types/calendario_reserva'

export interface ReservationCellProps {
  reservation: Reservation
  day: Date
  isSelected: boolean
  tooltipDisabled: boolean
  onSelect: (reservation: Reservation) => void
}

export function ReservationCell({
  reservation,
  day,
  isSelected,
  tooltipDisabled,
  onSelect,
}: ReservationCellProps) {
  const checkInDate = new Date(reservation.checkIn)
  checkInDate.setHours(0, 0, 0, 0)
  const checkOutDate = new Date(reservation.checkOut)
  checkOutDate.setHours(0, 0, 0, 0)
  const currentDate = new Date(day)
  currentDate.setHours(0, 0, 0, 0)

  const isCheckIn = isSameDay(currentDate, checkInDate)
  const isCheckOut = isSameDay(currentDate, checkOutDate) && !isCheckIn

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} open={tooltipDisabled ? false : undefined}>
        <TooltipTrigger asChild>
          {/* biome-ignore lint/a11y/useSemanticElements: interactive reservation cell */}
          <div
            role="button"
            onMouseDown={event => event.stopPropagation()}
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Reserva ${reservation.codigo} - ${reservation.titular.nome}`}
            data-reserva-id={reservation.id}
            data-status={reservation.status}
            className={cn(
              'absolute h-8 flex items-center justify-center cursor-pointer',
              // Check-in apenas: metade direita
              isCheckIn && !isCheckOut && 'w-1/3 right-0 rounded-l z-[3]',
              // Check-out apenas: metade esquerda
              isCheckOut && !isCheckIn && 'w-1/3 left-0 rounded-r z-[2]',
              // Dias intermediários: largura total sem bordas arredondadas
              !isCheckIn && !isCheckOut && 'w-full left-0 rounded-none z-[1]',
              // Temas por status: check-in laranja, confirmada primária 50%, a confirmar listrada
              reservation.status === 'check_in' && 'bg-status-checkin',
              reservation.status === 'confirmada' && 'bg-primary/50',
              reservation.status === 'a_confirmar' &&
                'bg-reservation-to-confirm',
              isSelected &&
                'ring-2 ring-selection-ring ring-offset-1 ring-offset-transparent shadow-selection z-[4]'
            )}
            onClick={() => onSelect(reservation)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(reservation)
              }
            }}
          />
        </TooltipTrigger>
        <TooltipContent className="w-80 max-w-[22rem] p-3 bg-popover text-popover-foreground border shadow-md">
          <ReservaResumoCard reservation={reservation} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
