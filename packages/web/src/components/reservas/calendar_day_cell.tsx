import { cn } from '@hotelmind/ui'
import type { MouseEvent } from 'react'
import { ReservationCell } from '@/components/reservas/reservation_cell'
import { to_iso_day } from '@/lib/calendar_range_selection'
import type { CellSelectionState } from '@/types/calendar_range_selection'
import type { Reservation } from '@/types/calendario_reserva'

const PRIMARY_MOUSE_BUTTON = 0

// Geometry mirrors the reservation bar (reservation_cell.tsx) so both line up:
// check-in on the right part, check-out on the left part, middle full width.
const OVERLAY_CLASSES: Record<Exclude<CellSelectionState, 'none'>, string> = {
  middle: 'inset-0 bg-range-selection',
  start: 'top-0 h-8 right-0 w-1/3 bg-range-selection rounded-l',
  end: 'top-0 h-8 left-0 w-1/3 bg-range-selection rounded-r',
}

interface CalendarDayCellProps {
  quarto: { id: string; numero: string }
  day: Date
  reservationsIntermediate: Reservation[]
  reservationsForCheckOut: Reservation[]
  reservationsForCheckIn: Reservation[]
  selectionState: CellSelectionState
  selectedReservationId: string | null
  isDragging: boolean
  onSelectReservation: (reservation: Reservation) => void
  onRangeStart: (
    quarto: { id: string; identificacao: string },
    dia: string
  ) => void
  onRangeExtend: (dia: string) => void
}

export function CalendarDayCell({
  quarto,
  day,
  reservationsIntermediate,
  reservationsForCheckOut,
  reservationsForCheckIn,
  selectionState,
  selectedReservationId,
  isDragging,
  onSelectReservation,
  onRangeStart,
  onRangeExtend,
}: CalendarDayCellProps) {
  const iso_day = to_iso_day(day)

  function handleMouseDown(event: MouseEvent<HTMLTableCellElement>) {
    if (event.button !== PRIMARY_MOUSE_BUTTON) return
    event.preventDefault()
    onRangeStart({ id: quarto.id, identificacao: quarto.numero }, iso_day)
  }

  return (
    <td
      data-testid={`calendar-day-cell-${quarto.id}-${iso_day}`}
      data-selection={selectionState !== 'none' ? selectionState : undefined}
      className="p-0 text-center relative border-r border-border last:border-r-0 overflow-visible"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => onRangeExtend(iso_day)}
    >
      <div className="relative w-full h-8 isolate">
        {selectionState !== 'none' && (
          <div
            aria-hidden="true"
            className={cn(
              'absolute z-0 pointer-events-none',
              OVERLAY_CLASSES[selectionState]
            )}
          />
        )}
        {reservationsIntermediate.map(reservation => (
          <ReservationCell
            key={reservation.id}
            reservation={reservation}
            day={day}
            isSelected={reservation.id === selectedReservationId}
            tooltipDisabled={isDragging}
            onSelect={onSelectReservation}
          />
        ))}
        {reservationsForCheckOut.map(reservation => (
          <ReservationCell
            key={reservation.id}
            reservation={reservation}
            day={day}
            isSelected={reservation.id === selectedReservationId}
            tooltipDisabled={isDragging}
            onSelect={onSelectReservation}
          />
        ))}
        {reservationsForCheckIn.map(reservation => (
          <ReservationCell
            key={reservation.id}
            reservation={reservation}
            day={day}
            isSelected={reservation.id === selectedReservationId}
            tooltipDisabled={isDragging}
            onSelect={onSelectReservation}
          />
        ))}
      </div>
    </td>
  )
}
