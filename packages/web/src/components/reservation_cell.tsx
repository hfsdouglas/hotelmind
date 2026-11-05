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

  const hasCheckedIn =
    reservation.status_code === 1 || reservation.status_code === null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute h-8 flex items-center justify-center cursor-pointer',
              // Check-in apenas: metade direita
              isCheckIn && !isCheckOut && 'w-1/3 right-0 rounded-l z-30',
              // Check-out apenas: metade esquerda
              isCheckOut && !isCheckIn && 'w-1/3 left-0 rounded-r z-20',
              // Dias intermediários: largura total sem bordas arredondadas
              !isCheckIn && !isCheckOut && 'w-full left-0 rounded-none z-10',
              // Apenas duas cores baseadas no status (check-in feito ou não)
              hasCheckedIn && 'bg-primary',
              !hasCheckedIn && 'bg-primary/50'
            )}
            onClick={() => onSelect(reservation)}
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
