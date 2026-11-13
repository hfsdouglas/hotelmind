import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { make_calendario_reservation } from '@/tests/utils/make_calendario_reservation'
import type { Reservation } from '@/types/calendario_reserva'
import { ReservationsProvider, useReservations } from './reservations_context'

const mockReservations: Reservation[] = [
  make_calendario_reservation({
    id: 'res-1',
    quartoId: 'room-101',
    checkIn: '2026-11-01T00:00:00',
    checkOut: '2026-11-05T00:00:00',
    status: 'confirmada',
  }),
  make_calendario_reservation({
    id: 'res-2',
    quartoId: 'room-102',
    checkIn: '2026-11-02T00:00:00',
    checkOut: '2026-11-06T00:00:00',
    status: 'a_confirmar',
    titular: { nome: 'Maria Souza', email: null, telefone: null },
  }),
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

    expect(result.current.getReservationById('res-2')?.titular.nome).toBe(
      'Maria Souza'
    )
    expect(result.current.getReservationById('non-existent')).toBeUndefined()
  })
})
