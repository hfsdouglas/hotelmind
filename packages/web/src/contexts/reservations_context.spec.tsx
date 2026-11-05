import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  type Reservation,
  ReservationsProvider,
  useReservations,
} from './reservations_context'

const mockReservations: Reservation[] = [
  {
    id: 'res-1',
    quartoId: 'room-101',
    checkIn: '2026-11-01',
    checkOut: '2026-11-05',
    status: 'confirmada',
    status_code: 1,
    hospede: {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999998888',
      documento: '12345678900',
    },
    pagamento: {
      metodo: 'pix',
      valor: 500,
      status: 'pago',
    },
  },
  {
    id: 'res-2',
    quartoId: 'room-102',
    checkIn: '2026-11-02',
    checkOut: '2026-11-06',
    status: 'pendente',
    status_code: 0,
    hospede: {
      nome: 'Maria Souza',
      email: 'maria@example.com',
      telefone: '11988887777',
      documento: '98765432100',
    },
    pagamento: {
      metodo: 'cartao',
      valor: 800,
      status: 'pendente',
    },
  },
]

describe('reservations_context', () => {
  it('throws error when useReservations is used outside provider', () => {
    expect(() => renderHook(() => useReservations())).toThrow(
      'useReservations must be used within ReservationsProvider'
    )
  })

  it('provides reservations and filters by room', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ReservationsProvider reservations={mockReservations}>
        {children}
      </ReservationsProvider>
    )

    const { result } = renderHook(() => useReservations(), { wrapper })

    expect(result.current.reservations).toHaveLength(2)
    expect(result.current.getReservationsByRoom('room-101')).toHaveLength(1)
    expect(result.current.getReservationsByRoom('room-101')[0]?.id).toBe(
      'res-1'
    )
    expect(result.current.getReservationsByRoom('room-999')).toHaveLength(0)
  })

  it('finds reservation by id', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ReservationsProvider reservations={mockReservations}>
        {children}
      </ReservationsProvider>
    )

    const { result } = renderHook(() => useReservations(), { wrapper })

    expect(result.current.getReservationById('res-2')?.hospede.nome).toBe(
      'Maria Souza'
    )
    expect(result.current.getReservationById('non-existent')).toBeUndefined()
  })
})
