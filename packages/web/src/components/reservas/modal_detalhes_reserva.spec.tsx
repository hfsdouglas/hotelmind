import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  make_calendario_reservation,
  make_calendario_reservation_0102,
} from '@/tests/utils/make_calendario_reservation'
import type { Reservation } from '@/types/calendario_reserva'
import { ModalDetalhesReserva } from './modal_detalhes_reserva'

function render_modal(reservation: Reservation | null) {
  render(
    <MemoryRouter>
      <ModalDetalhesReserva
        open
        reservation={reservation}
        onOpenChange={vi.fn()}
      />
    </MemoryRouter>
  )
  return screen.getByRole('dialog', { name: 'Detalhes da Reserva' })
}

describe('ModalDetalhesReserva', () => {
  it('shows the real data of a reservation with a partner and missing contacts', () => {
    const dialog = render_modal(make_calendario_reservation_0102())

    for (const text of [
      'RES-0102',
      'Confirmada',
      '102',
      'Suíte Luxo',
      '01/12/2026',
      '03/12/2026',
      '2 diárias',
      'Fernanda Alves',
      '2 adultos, 1 criança',
      'Pensão Completa',
      'Agência Sol',
      'R$ 980,50',
      '0 de 2 fichas FNRH preenchidas',
    ]) {
      expect(within(dialog).getByText(text)).toBeInTheDocument()
    }
    expect(within(dialog).getAllByText('-').length).toBeGreaterThanOrEqual(2)
  })

  it('omits the Observações section when there are none', () => {
    const dialog = render_modal(make_calendario_reservation_0102())

    expect(within(dialog).queryByText('Observações')).toBeNull()
  })

  it('shows observations and the direct-booking origin for a reservation without partner', () => {
    const dialog = render_modal(make_calendario_reservation())

    expect(within(dialog).getByText('Chegada tardia')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Balcão / Reserva Direta')
    ).toBeInTheDocument()
  })

  it('does not show payment information', () => {
    const dialog = render_modal(make_calendario_reservation())

    expect(within(dialog).queryByText('Pago')).toBeNull()
    expect(within(dialog).queryByText('Pendente')).toBeNull()
  })

  it('links to the reservation page', () => {
    const dialog = render_modal(make_calendario_reservation_0102())

    expect(
      within(dialog).getByRole('link', { name: 'Abrir reserva' })
    ).toHaveAttribute('href', '/reservas/reserva-102')
  })
})
