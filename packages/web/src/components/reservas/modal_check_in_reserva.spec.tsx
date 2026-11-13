import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  make_calendario_reservation,
  make_calendario_reservation_0102,
} from '@/tests/utils/make_calendario_reservation'
import type { Reservation } from '@/types/calendario_reserva'
import { ModalCheckInReserva } from './modal_check_in_reserva'

const HOJE = new Date(2026, 11, 1)

function render_modal(
  reservation: Reservation | null = make_calendario_reservation(),
  props: Partial<React.ComponentProps<typeof ModalCheckInReserva>> = {}
) {
  const handlers = { onOpenChange: vi.fn(), onConfirmar: vi.fn() }
  render(
    <ModalCheckInReserva
      open
      reservation={reservation}
      hoje={HOJE}
      isPending={false}
      {...handlers}
      {...props}
    />
  )
  const dialog = screen.getByRole('dialog', { name: 'Confirmar check-in' })
  return { dialog, ...handlers }
}

describe('ModalCheckInReserva - sem pendências', () => {
  it('shows the reservation data and observations', () => {
    const { dialog } = render_modal()

    for (const text of [
      'RES-0101',
      '101',
      'Suíte Luxo',
      '02/12/2026',
      '04/12/2026',
      '2 diárias',
      '2 adultos',
      'Pensão Completa',
      'R$ 1.500,00',
      'Chegada tardia',
      '2 de 2 fichas FNRH preenchidas',
    ]) {
      expect(within(dialog).getByText(text)).toBeInTheDocument()
    }
    expect(within(dialog).getAllByText('Ana Souza').length).toBeGreaterThan(0)
  })

  it('shows "Sem observações" when there are none', () => {
    const { dialog } = render_modal(
      make_calendario_reservation({ observacoes: null })
    )

    expect(within(dialog).getByText('Sem observações')).toBeInTheDocument()
  })

  it('omits the partner row when there is no partner', () => {
    const { dialog } = render_modal(
      make_calendario_reservation({ parceiro_nome: null })
    )

    expect(within(dialog).queryByText(/Parceiro/)).toBeNull()
  })

  it('warns about early check-in', () => {
    const { dialog } = render_modal()

    expect(
      within(dialog).getByText(
        'Check-in antecipado: a entrada prevista é 02/12/2026'
      )
    ).toBeInTheDocument()
  })

  it('does not warn when the arrival is today', () => {
    const { dialog } = render_modal(
      make_calendario_reservation({ checkIn: '2026-12-01T00:00:00' })
    )

    expect(within(dialog).queryByText(/Check-in antecipado/)).toBeNull()
  })

  it('shows "Nenhuma ficha FNRH cadastrada" with a plain confirm button when there are no guests', () => {
    const { dialog } = render_modal(
      make_calendario_reservation({
        hospedes: [],
        total_hospedes: 0,
        fichas_preenchidas: 0,
      })
    )

    expect(
      within(dialog).getByText('Nenhuma ficha FNRH cadastrada')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    ).toBeInTheDocument()
  })

  it('confirms with the "confirmar" option', async () => {
    const user = userEvent.setup()
    const { dialog, onConfirmar } = render_modal()

    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    )

    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onConfirmar).toHaveBeenCalledWith('confirmar')
  })

  it('disables the confirm button while pending', () => {
    const { dialog } = render_modal(make_calendario_reservation(), {
      isPending: true,
    })

    expect(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    ).toBeDisabled()
  })

  it('closes through "Cancelar"', async () => {
    const user = userEvent.setup()
    const { dialog, onOpenChange } = render_modal()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('ModalCheckInReserva - fichas FNRH pendentes', () => {
  it('lists the pending forms and says filling is optional', () => {
    const { dialog } = render_modal(make_calendario_reservation_0102())

    expect(
      within(dialog).getByText('2 fichas FNRH pendentes')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('0 de 2 fichas FNRH preenchidas')
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Hóspede 1 - Pendente')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Carlos Lima - Rascunho')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('O preenchimento é opcional.')
    ).toBeInTheDocument()
  })

  it('uses the singular for a single pending form', () => {
    const { dialog } = render_modal(
      make_calendario_reservation_0102({
        hospedes: [
          { posicao: 1, nome: 'Fernanda Alves', ficha_status: 'preenchida' },
          { posicao: 2, nome: 'Carlos Lima', ficha_status: 'rascunho' },
        ],
        fichas_preenchidas: 1,
      })
    )

    expect(
      within(dialog).getByText('1 ficha FNRH pendente')
    ).toBeInTheDocument()
  })

  it('offers both confirm options instead of the plain confirm', () => {
    const { dialog } = render_modal(make_calendario_reservation_0102())

    expect(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in e preencher FNRHs',
      })
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in sem preencher',
      })
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Cancelar' })
    ).toBeVisible()
    expect(
      within(dialog).queryByRole('button', { name: 'Confirmar check-in' })
    ).toBeNull()
  })

  it('confirms with "preencher_fnrh"', async () => {
    const user = userEvent.setup()
    const { dialog, onConfirmar } = render_modal(
      make_calendario_reservation_0102()
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in e preencher FNRHs',
      })
    )

    expect(onConfirmar).toHaveBeenCalledWith('preencher_fnrh')
  })

  it('confirms with "sem_preencher"', async () => {
    const user = userEvent.setup()
    const { dialog, onConfirmar } = render_modal(
      make_calendario_reservation_0102()
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in sem preencher',
      })
    )

    expect(onConfirmar).toHaveBeenCalledWith('sem_preencher')
  })

  it('disables both confirm buttons while pending', () => {
    const { dialog } = render_modal(make_calendario_reservation_0102(), {
      isPending: true,
    })

    expect(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in e preencher FNRHs',
      })
    ).toBeDisabled()
    expect(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in sem preencher',
      })
    ).toBeDisabled()
  })
})
