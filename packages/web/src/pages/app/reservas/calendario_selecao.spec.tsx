import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QUARTO_101_ID, QUARTO_102_ID } from '@/mocks/quartos/quartos_handlers'
import { server } from '@/mocks/server'
import { Calendario } from './calendario'

const BASE_URL = 'http://localhost:3000'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  )
}

function render_calendario() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const tree = () => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/reservas/calendario']}>
        <aside>
          <button type="button">Menu lateral</button>
        </aside>
        <LocationProbe />
        <Calendario />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const utils = render(tree())
  return { ...utils, remount: () => utils.rerender(tree()) }
}

function cell(quarto_id: string, iso_day: string) {
  return screen.getByTestId(`calendar-day-cell-${quarto_id}-${iso_day}`)
}

async function wait_for_grid(iso_day = '2026-12-01') {
  await screen.findByTestId(`calendar-day-cell-${QUARTO_101_ID}-${iso_day}`)
}

function selected_cells() {
  return Array.from(document.querySelectorAll('[data-selection]'))
}

function states(quarto_id: string, days: string[]) {
  return days.map(day => cell(quarto_id, day).getAttribute('data-selection'))
}

function drag(quarto_id: string, from: string, to: string) {
  fireEvent.mouseDown(cell(quarto_id, from), { button: 0 })
  fireEvent.mouseEnter(cell(quarto_id, to))
  fireEvent.mouseUp(window)
}

function bars_of(reserva_id: string) {
  return Array.from(
    document.querySelectorAll(`[data-reserva-id="${reserva_id}"]`)
  )
}

function bar_in(quarto_id: string, iso_day: string) {
  return within(cell(quarto_id, iso_day)).getByRole('button')
}

function expect_only_selected(reserva_id: string | null) {
  for (const id of ['reserva-101', 'reserva-102']) {
    const expected = id === reserva_id ? 'true' : 'false'
    const bars = bars_of(id)
    expect(bars.length).toBeGreaterThan(0)
    for (const bar of bars) {
      expect(bar).toHaveAttribute('aria-pressed', expected)
    }
  }
}

function make_user() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 11, 1))
  vi.spyOn(toast, 'success').mockImplementation(() => 'id')
  vi.spyOn(toast, 'error').mockImplementation(() => 'id')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Calendario - seleção por arraste (US1)', () => {
  it('highlights only the days dragged on the origin suite row', async () => {
    render_calendario()
    await wait_for_grid()

    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')

    expect(
      states(QUARTO_101_ID, [
        '2026-12-01',
        '2026-12-02',
        '2026-12-03',
        '2026-12-04',
      ])
    ).toEqual(['start', 'middle', 'middle', 'end'])
    expect(cell(QUARTO_101_ID, '2026-12-05')).not.toHaveAttribute(
      'data-selection'
    )
    expect(selected_cells()).toHaveLength(4)
  })

  it('stays locked on the origin row while the pointer crosses another suite row', async () => {
    render_calendario()
    await wait_for_grid()

    fireEvent.mouseDown(cell(QUARTO_101_ID, '2026-12-01'), { button: 0 })
    fireEvent.mouseEnter(cell(QUARTO_102_ID, '2026-12-02'))
    fireEvent.mouseEnter(cell(QUARTO_102_ID, '2026-12-04'))
    fireEvent.mouseUp(window)

    expect(
      states(QUARTO_101_ID, [
        '2026-12-01',
        '2026-12-02',
        '2026-12-03',
        '2026-12-04',
      ])
    ).toEqual(['start', 'middle', 'middle', 'end'])
    const row_102 = ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04']
    expect(states(QUARTO_102_ID, row_102)).toEqual([null, null, null, null])
  })

  it('normalizes a backward drag', async () => {
    render_calendario()
    await wait_for_grid()

    drag(QUARTO_101_ID, '2026-12-06', '2026-12-03')

    expect(
      states(QUARTO_101_ID, [
        '2026-12-03',
        '2026-12-04',
        '2026-12-05',
        '2026-12-06',
      ])
    ).toEqual(['start', 'middle', 'middle', 'end'])
  })

  it('finishes the selection when the mouse is released outside the table', async () => {
    render_calendario()
    await wait_for_grid()

    fireEvent.mouseDown(cell(QUARTO_101_ID, '2026-12-01'), { button: 0 })
    fireEvent.mouseEnter(cell(QUARTO_101_ID, '2026-12-04'))
    fireEvent.mouseUp(document.body)
    fireEvent.mouseEnter(cell(QUARTO_101_ID, '2026-12-09'))

    expect(cell(QUARTO_101_ID, '2026-12-04')).toHaveAttribute(
      'data-selection',
      'end'
    )
    expect(cell(QUARTO_101_ID, '2026-12-09')).not.toHaveAttribute(
      'data-selection'
    )
  })

  it('leaves no selection when the mouse is pressed and released on the same cell', async () => {
    render_calendario()
    await wait_for_grid()

    fireEvent.mouseDown(cell(QUARTO_101_ID, '2026-12-03'), { button: 0 })
    fireEvent.mouseUp(window)

    expect(selected_cells()).toHaveLength(0)
  })

  it('ignores the secondary mouse button', async () => {
    render_calendario()
    await wait_for_grid()

    fireEvent.mouseDown(cell(QUARTO_101_ID, '2026-12-01'), { button: 2 })
    fireEvent.mouseEnter(cell(QUARTO_101_ID, '2026-12-04'))
    fireEvent.mouseUp(window)

    expect(selected_cells()).toHaveLength(0)
  })

  it('replaces the previous selection when a new drag starts on another suite', async () => {
    render_calendario()
    await wait_for_grid()
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')

    drag(QUARTO_102_ID, '2026-12-08', '2026-12-10')

    expect(
      states(QUARTO_102_ID, ['2026-12-08', '2026-12-09', '2026-12-10'])
    ).toEqual(['start', 'middle', 'end'])
    expect(cell(QUARTO_101_ID, '2026-12-01')).not.toHaveAttribute(
      'data-selection'
    )
    expect(selected_cells()).toHaveLength(3)
  })

  it('announces the selected period in a status region', async () => {
    render_calendario()
    await wait_for_grid()

    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')

    expect(screen.getByRole('status')).toHaveTextContent(
      'Período selecionado: Suíte 101, de 01/12/2026 a 04/12/2026'
    )
  })
})

describe('Calendario - seleção de reserva (spec 032 US1)', () => {
  it('selects the whole reservation, without opening any dialog, when clicking a bar', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()

    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(bars_of('reserva-101').length).toBeGreaterThan(1)
    expect_only_selected('reserva-101')
    expect(selected_cells()).toHaveLength(0)
  })

  it('moves the highlight when clicking another reservation', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    await user.click(bar_in(QUARTO_102_ID, '2026-12-02'))

    expect_only_selected('reserva-102')
  })

  it('keeps the selection when clicking the selected reservation again', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_102_ID, '2026-12-02'))

    await user.click(bar_in(QUARTO_102_ID, '2026-12-02'))

    expect_only_selected('reserva-102')
  })

  it('selects the focused bar with Enter', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()

    bar_in(QUARTO_101_ID, '2026-12-03').focus()
    await user.keyboard('{Enter}')

    expect_only_selected('reserva-101')
  })

  it('clears the reservation with Escape', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    await user.keyboard('{Escape}')

    expect_only_selected(null)
  })

  it('clears the reservation when pressing outside the calendar', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    await user.click(document.body)

    expect_only_selected(null)
  })

  it('clears the reservation and starts a period selection when pressing a free cell area', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    drag(QUARTO_101_ID, '2026-12-10', '2026-12-12')

    expect_only_selected(null)
    expect(states(QUARTO_101_ID, ['2026-12-10', '2026-12-12'])).toEqual([
      'start',
      'end',
    ])
  })

  it('replaces an active period selection when clicking a reservation bar', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    drag(QUARTO_101_ID, '2026-12-10', '2026-12-12')
    expect(selected_cells()).toHaveLength(3)

    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    expect(selected_cells()).toHaveLength(0)
    expect_only_selected('reserva-101')
  })

  it.each([
    'Dia anterior',
    'Próximo dia',
    'Voltar 15 dias',
    'Avançar 15 dias',
  ])('clears the reservation when using "%s"', async name => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))

    await user.click(screen.getByRole('button', { name }))

    for (const bar of document.querySelectorAll('[data-reserva-id]')) {
      expect(bar).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('Calendario - remoção da seleção (US2)', () => {
  async function select_default() {
    render_calendario()
    await wait_for_grid()
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')
    expect(selected_cells()).toHaveLength(4)
  }

  it('clears the selection on a mousedown outside the calendar page', async () => {
    const user = make_user()
    await select_default()

    await user.click(screen.getByRole('button', { name: 'Menu lateral' }))

    expect(selected_cells()).toHaveLength(0)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('clears the selection when clicking the calendar title', async () => {
    const user = make_user()
    await select_default()

    await user.click(screen.getByText('Calendário'))

    expect(selected_cells()).toHaveLength(0)
  })

  it('keeps the selection when clicking inside the grid', async () => {
    const user = make_user()
    await select_default()

    await user.click(screen.getByText('102'))

    expect(selected_cells()).toHaveLength(4)
  })

  it.each([
    'Dia anterior',
    'Próximo dia',
    'Voltar 15 dias',
    'Avançar 15 dias',
  ])('clears the selection when using "%s"', async name => {
    const user = make_user()
    await select_default()

    await user.click(screen.getByRole('button', { name }))

    expect(selected_cells()).toHaveLength(0)
  })

  it('clears the selection when another month is chosen in the date popover', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(
      screen.getByRole('button', { name: 'Selecionar mês e ano' })
    )
    await screen.findByTestId('calendar-datepicker-popover')
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')
    expect(selected_cells()).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: 'Janeiro' }))

    expect(selected_cells()).toHaveLength(0)
  })

  it('keeps the selection when clicking the Nova Reserva button', async () => {
    const user = make_user()
    await select_default()

    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))

    expect(selected_cells()).toHaveLength(4)
  })

  it('clears the selection with Escape', async () => {
    const user = make_user()
    await select_default()

    await user.keyboard('{Escape}')

    expect(selected_cells()).toHaveLength(0)
  })

  it('closes the details modal with Escape without clearing the reservation selection', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await user.click(bar_in(QUARTO_101_ID, '2026-12-03'))
    await user.click(screen.getByRole('button', { name: 'Detalhes' }))
    await screen.findByRole('dialog', { name: 'Detalhes da Reserva' })

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect_only_selected('reserva-101')
  })

  it('does not restore the selection after remounting nor persist it anywhere', async () => {
    const { unmount } = render_calendario()
    await wait_for_grid()
    const storage_before = [localStorage.length, sessionStorage.length]
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      /^\/reservas\/calendario$/
    )
    expect([localStorage.length, sessionStorage.length]).toEqual(storage_before)

    unmount()
    render_calendario()
    await wait_for_grid()

    expect(selected_cells()).toHaveLength(0)
  })
})

describe('Calendario - nova reserva em modal (US3)', () => {
  async function open_modal_with_selection() {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')
    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nova Reserva' })
    return { user, dialog }
  }

  async function choose_regime_and_fill(
    user: ReturnType<typeof make_user>,
    dialog: HTMLElement
  ) {
    await user.click(
      await within(dialog).findByRole('button', { name: /Pensão Completa/ })
    )
    await within(dialog).findByText(/Proposta selecionada: Suíte 101/)
    await user.type(
      within(dialog).getByLabelText('Nome Completo *'),
      'Maria Souza'
    )
  }

  it('opens the modal prefilled with the selected period', async () => {
    const { dialog } = await open_modal_with_selection()

    expect(within(dialog).getByLabelText('Data de Check-in *')).toHaveValue(
      '01/12/2026'
    )
    expect(within(dialog).getByLabelText('Data de Check-out *')).toHaveValue(
      '04/12/2026'
    )
  })

  it('selects the preferred suite automatically after choosing a regime', async () => {
    const { user, dialog } = await open_modal_with_selection()

    await user.click(
      await within(dialog).findByRole('button', { name: /Pensão Completa/ })
    )

    expect(
      await within(dialog).findByText(/Proposta selecionada: Suíte 101/)
    ).toBeInTheDocument()
  })

  it('shows the preferred suite and the first regime selected right after opening, without clicking a regime', async () => {
    const { dialog } = await open_modal_with_selection()

    expect(
      await within(dialog).findByText(/Proposta selecionada: Suíte 101/)
    ).toBeInTheDocument()
    expect(
      within(
        within(dialog).getByRole('button', { name: /Pensão Completa/ })
      ).getByText('Selecionado ✓')
    ).toBeInTheDocument()
  })

  it('keeps the suite selected when the operator clicks the already selected regime', async () => {
    const { user, dialog } = await open_modal_with_selection()
    await within(dialog).findByText(/Proposta selecionada: Suíte 101/)

    await user.click(
      within(dialog).getByRole('button', { name: /Pensão Completa/ })
    )

    expect(
      await within(dialog).findByText(/Proposta selecionada: Suíte 101/)
    ).toBeInTheDocument()
  })

  it('opens without any preselection when the modal is opened without a drag selection', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()

    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nova Reserva' })

    await within(dialog).findByRole('button', { name: /Meia Pensão/ })
    expect(within(dialog).queryByText('Selecionado ✓')).toBeNull()
    expect(within(dialog).queryByText(/Proposta selecionada/)).toBeNull()
  })

  it('saves, toasts, closes the modal, clears the selection and reloads the reservations', async () => {
    let list_requests = 0
    server.use(
      http.get(`${BASE_URL}/reservas`, () => {
        list_requests += 1
        return HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
        })
      })
    )
    const { user, dialog } = await open_modal_with_selection()
    await waitFor(() => expect(list_requests).toBe(1))
    await choose_regime_and_fill(user, dialog)

    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Reserva RES-0002 cadastrada com sucesso!'
      )
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(selected_cells()).toHaveLength(0)
    await waitFor(() => expect(list_requests).toBeGreaterThan(1))
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      /^\/reservas\/calendario$/
    )
  })

  it('keeps the selection when closing with Cancelar', async () => {
    const { user, dialog } = await open_modal_with_selection()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(selected_cells()).toHaveLength(4)
  })

  it('keeps the selection when closing with Escape', async () => {
    const { user } = await open_modal_with_selection()

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(selected_cells()).toHaveLength(4)
  })

  it('keeps the selection when closing with the X button', async () => {
    const { user, dialog } = await open_modal_with_selection()

    await user.click(within(dialog).getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(selected_cells()).toHaveLength(4)
  })

  it('keeps the selection when interacting inside the dialog', async () => {
    const { user, dialog } = await open_modal_with_selection()

    await user.click(within(dialog).getByLabelText('Nome Completo *'))
    await user.type(within(dialog).getByLabelText('Nome Completo *'), 'Ma')
    await user.click(within(dialog).getByText('Passo 1: Período e Hóspedes'))

    expect(selected_cells()).toHaveLength(4)
  })

  it('opens an empty form when there is no selection', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()

    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))

    const dialog = await screen.findByRole('dialog', { name: 'Nova Reserva' })
    expect(within(dialog).getByLabelText('Data de Check-in *')).toHaveValue('')
    expect(within(dialog).getByLabelText('Data de Check-out *')).toHaveValue('')
  })

  it('discards typed data after closing and reopening', async () => {
    const { user, dialog } = await open_modal_with_selection()
    await user.type(
      within(dialog).getByLabelText('Nome Completo *'),
      'Maria Souza'
    )
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))

    const reopened = await screen.findByRole('dialog', { name: 'Nova Reserva' })
    expect(within(reopened).getByLabelText('Nome Completo *')).toHaveValue('')
  })
})

describe('Calendario - isolamento entre hotéis (US4)', () => {
  async function open_modal() {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    drag(QUARTO_101_ID, '2026-12-01', '2026-12-04')
    await user.click(screen.getByRole('button', { name: 'Nova Reserva' }))
    const dialog = await screen.findByRole('dialog', { name: 'Nova Reserva' })
    return { user, dialog }
  }

  it('never sends hotel_id and sends only the suite returned by the hotel availability', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      http.post(`${BASE_URL}/reservas`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { id: 'reserva-nova', codigo: 'RES-0002' },
          { status: 201 }
        )
      })
    )
    const { user, dialog } = await open_modal()
    await user.click(
      await within(dialog).findByRole('button', { name: /Pensão Completa/ })
    )
    await within(dialog).findByText(/Proposta selecionada: Suíte 101/)
    await user.type(
      within(dialog).getByLabelText('Nome Completo *'),
      'Maria Souza'
    )

    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(body).toBeDefined())
    expect(body).not.toHaveProperty('hotel_id')
    expect(body?.quarto_id).toBe(QUARTO_101_ID)
  })

  it('warns and selects nothing when the preferred suite is outside the hotel availability', async () => {
    server.use(
      http.get(`${BASE_URL}/reservas/disponibilidade`, () =>
        HttpResponse.json([
          {
            quarto_id: '00000000-0000-4000-8000-0000000000e1',
            identificacao: '777',
            categoria_id: 'categoria-x',
            categoria_nome: 'Outra Categoria',
            limite_hospedes: 2,
            valor_total: '500.00',
          },
        ])
      )
    )
    const { user, dialog } = await open_modal()

    await user.click(
      await within(dialog).findByRole('button', { name: /Pensão Completa/ })
    )

    expect(
      await within(dialog).findByText(
        'A suíte 101 não está disponível para os critérios informados. Escolha outra suíte.'
      )
    ).toBeInTheDocument()
    expect(within(dialog).queryByText(/Proposta selecionada/)).toBeNull()
  })
})
