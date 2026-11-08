import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Reservation } from '@/contexts/reservations_context'
import { ReservationCell } from './reservation_cell'

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
      />
    )

    const cell = container.querySelector('.cursor-pointer')
    expect(cell).toBeInTheDocument()
    if (cell) await user.click(cell)

    expect(onSelect).toHaveBeenCalledWith(mockReservation)
  })

  it('renders check-in position styling with z-[3]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-10T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.right-0')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[3]')
  })

  it('renders check-out position styling with z-[2]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-15T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.left-0')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[2]')
  })

  it('renders intermediate day styling with z-[1]', () => {
    const { container } = render(
      <ReservationCell
        reservation={mockReservation}
        day={new Date('2026-11-12T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('.w-full')
    expect(cell).toBeInTheDocument()
    expect(cell).toHaveClass('z-[1]')
  })

  it('renders bg-primary for check-in status (status_code: 1)', () => {
    const { container } = render(
      <ReservationCell
        reservation={{ ...mockReservation, status: 'Check In', status_code: 1 }}
        day={new Date('2026-11-12T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('[role="button"]')
    expect(cell).toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-primary/50')
    expect(cell).not.toHaveClass('bg-reservation-to-confirm')
  })

  it('renders bg-primary/50 for confirmed status (status_code: 0)', () => {
    const { container } = render(
      <ReservationCell
        reservation={{
          ...mockReservation,
          status: 'Confirmada',
          status_code: 0,
        }}
        day={new Date('2026-11-12T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('[role="button"]')
    expect(cell).toHaveClass('bg-primary/50')
    expect(cell).not.toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-reservation-to-confirm')
  })

  it('renders diagonal zebra theme (bg-reservation-to-confirm) for "a confirmar" status', () => {
    const { container } = render(
      <ReservationCell
        reservation={{
          ...mockReservation,
          status: 'A Confirmar',
          status_code: 2,
        }}
        day={new Date('2026-11-12T00:00:00')}
        onSelect={vi.fn()}
      />
    )

    const cell = container.querySelector('[role="button"]')
    expect(cell).toHaveClass('bg-reservation-to-confirm')
    expect(cell).not.toHaveClass('bg-primary')
    expect(cell).not.toHaveClass('bg-primary/50')
  })
})
