import { isSameDay } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Reservation } from '@/contexts/reservations_context'
import { cn } from '@/lib/utils'

export interface ReservationCellProps {
  reservation: Reservation
  day: Date
  onSelect: (reservation: Reservation) => void
}

export function ReservationCell({
  reservation,
  day,
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

  const isToConfirm =
    reservation.status_code === 2 ||
    reservation.status === 'a_confirmar' ||
    reservation.status === 'A Confirmar'
  const hasCheckedIn =
    !isToConfirm &&
    (reservation.status_code === 1 || reservation.status_code === null)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* biome-ignore lint/a11y/useSemanticElements: interactive reservation cell */}
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'absolute h-8 flex items-center justify-center cursor-pointer',
              // Check-in apenas: metade direita
              isCheckIn && !isCheckOut && 'w-1/3 right-0 rounded-l z-[3]',
              // Check-out apenas: metade esquerda
              isCheckOut && !isCheckIn && 'w-1/3 left-0 rounded-r z-[2]',
              // Dias intermediários: largura total sem bordas arredondadas
              !isCheckIn && !isCheckOut && 'w-full left-0 rounded-none z-[1]',
              // Três temas visuais baseados no status da reserva:
              // 1. Check-in realizado: cor primária sólida
              hasCheckedIn && 'bg-primary',
              // 2. Confirmada: cor primária com 50% de opacidade
              !hasCheckedIn && !isToConfirm && 'bg-primary/50',
              // 3. A confirmar: listras diagonais (zebrinha) com microespaçamento começando no canto inferior esquerdo
              isToConfirm && 'bg-reservation-to-confirm'
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
        {reservation.observacoes && (
          <TooltipContent>
            <p className="max-w-xs">{reservation.observacoes}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
