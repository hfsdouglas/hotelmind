import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { make_calendario_reservation } from '@/tests/utils/make_calendario_reservation'
import type { Reservation } from '@/types/calendario_reserva'
import { CalendarioBarraAcoes } from './calendario_barra_acoes'

function render_barra(reservaSelecionada: Reservation | null = null) {
  const handlers = {
    onNovaReserva: vi.fn(),
    onCheckIn: vi.fn(),
    onDetalhes: vi.fn(),
  }
  render(
    <CalendarioBarraAcoes
      reservaSelecionada={reservaSelecionada}
      {...handlers}
    />
  )
  return handlers
}

function icon_of(button: HTMLElement) {
  return button.querySelector('svg')
}

describe('CalendarioBarraAcoes', () => {
  it('renders Nova Reserva, Check-in and Detalhes in this order with their icons', () => {
    render_barra()

    const buttons = screen.getAllByRole('button')

    expect(buttons.map(b => b.textContent)).toEqual([
      'Nova Reserva',
      'Check-in',
      'Detalhes',
    ])
    expect(icon_of(buttons[0])).toHaveClass('lucide-calendar-plus')
    expect(icon_of(buttons[1])).toHaveClass('lucide-bell-ring')
    expect(icon_of(buttons[2])).toHaveClass('lucide-info')
  })

  describe('Check-in', () => {
    it('is disabled with a hint when nothing is selected', async () => {
      const user = userEvent.setup()
      render_barra(null)

      const button = screen.getByRole('button', { name: 'Check-in' })
      expect(button).toBeDisabled()
      await user.hover(button.parentElement as HTMLElement)

      expect(
        (
          await screen.findAllByText(
            'Selecione uma reserva para fazer check-in'
          )
        ).length
      ).toBeGreaterThan(0)
    })

    it('is disabled asking to confirm an a_confirmar reservation', async () => {
      const user = userEvent.setup()
      render_barra(make_calendario_reservation({ status: 'a_confirmar' }))

      const button = screen.getByRole('button', { name: 'Check-in' })
      expect(button).toBeDisabled()
      await user.hover(button.parentElement as HTMLElement)

      expect(
        (await screen.findAllByText('Confirme a reserva antes do check-in'))
          .length
      ).toBeGreaterThan(0)
    })

    it('is disabled when check-in was already done', async () => {
      const user = userEvent.setup()
      render_barra(make_calendario_reservation({ status: 'check_in' }))

      const button = screen.getByRole('button', { name: 'Check-in' })
      expect(button).toBeDisabled()
      await user.hover(button.parentElement as HTMLElement)

      expect(
        (await screen.findAllByText('Check-in já realizado')).length
      ).toBeGreaterThan(0)
    })

    it('is enabled for a confirmada reservation and calls onCheckIn', async () => {
      const user = userEvent.setup()
      const { onCheckIn } = render_barra(
        make_calendario_reservation({ status: 'confirmada' })
      )

      const button = screen.getByRole('button', { name: 'Check-in' })
      expect(button).toBeEnabled()
      await user.click(button)

      expect(onCheckIn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Nova Reserva', () => {
    it.each([
      ['without selection', null],
      ['with a selection', make_calendario_reservation()],
    ])('calls onNovaReserva %s', async (_label, selecionada) => {
      const user = userEvent.setup()
      const { onNovaReserva } = render_barra(selecionada)

      await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))

      expect(onNovaReserva).toHaveBeenCalledTimes(1)
    })
  })

  describe('Detalhes', () => {
    it('is disabled with a hint when nothing is selected', async () => {
      const user = userEvent.setup()
      render_barra(null)

      const button = screen.getByRole('button', { name: 'Detalhes' })
      expect(button).toBeDisabled()
      await user.hover(button.parentElement as HTMLElement)

      expect(
        (
          await screen.findAllByText(
            'Selecione uma reserva para ver os detalhes'
          )
        ).length
      ).toBeGreaterThan(0)
    })

    it('is enabled with a selection and calls onDetalhes', async () => {
      const user = userEvent.setup()
      const { onDetalhes } = render_barra(make_calendario_reservation())

      const button = screen.getByRole('button', { name: 'Detalhes' })
      expect(button).toBeEnabled()
      await user.click(button)

      expect(onDetalhes).toHaveBeenCalledTimes(1)
    })
  })
})
