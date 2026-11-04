import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReservationCell } from './reservation_cell'
import type { Reservation } from '@/contexts/reservations_context'

const mockReservation: Reservation = {
  id: 'res-1',
  quartoId: 'room-1',
  checkIn: '2026-11-10T14:00:00Z',
  checkOut: '2026-11-15T10:00:00Z',
  status: 'confirmada',
  status_code: 1,
  observacoes: 'Hóspede prefere andar alto',
  hospede: {
    nome: 'Carlos',
    email: 'carlos@test.com',
    telefone: '11999998888',
    documento: '12345678900',
  },
  pagamento: {
    metodo: 'pix',
    valor: 1200,
    status: 'pago',
  },
}

describe('ReservationCell', () => {
  it('calls onSelect when cell is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-12T12:00:00Z')}
        onSelect={onSelect}
      />,
    )

    const cell = container.querySelector('.cursor-pointer')
    expect(cell).toBeInTheDocument()
    if (cell) await user.click(cell)

    expect(onSelect).toHaveBeenCalledWith(mockReservation)
  })

  it('renders check-in position styling', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-10T00:00:00')}
        onSelect={vi.fn()}
      />,
    )

    const cell = container.querySelector('.right-0')
    expect(cell).toBeInTheDocument()
  })
})
