import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QUARTO_101_ID, QUARTO_102_ID } from '@/mocks/quartos/quartos_handlers'
import { ultimo_corpo_alterar_status } from '@/mocks/reservas/reservas_handlers'
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
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/reservas/calendario']}>
        <LocationProbe />
        <Routes>
          <Route path="/reservas/calendario" element={<Calendario />} />
          <Route path="/reservas/:id" element={<div>Detalhe da reserva</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function make_user() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

function cell(quarto_id: string, iso_day: string) {
  return screen.getByTestId(`calendar-day-cell-${quarto_id}-${iso_day}`)
}

async function wait_for_grid() {
  await screen.findByTestId(`calendar-day-cell-${QUARTO_101_ID}-2026-12-01`)
  await waitFor(() =>
    expect(document.querySelector('[data-reserva-id]')).not.toBeNull()
  )
}

function bars_of(reserva_id: string) {
  return Array.from(
    document.querySelectorAll(`[data-reserva-id="${reserva_id}"]`)
  )
}

function dot_of(numero: string) {
  return screen.getByText(numero).closest('tr')?.querySelector('[data-status]')
}

async function select_reserva(
  user: ReturnType<typeof make_user>,
  quarto_id: string,
  iso_day: string
) {
  await user.click(within(cell(quarto_id, iso_day)).getByRole('button'))
}

async function open_check_in(
  user: ReturnType<typeof make_user>,
  quarto_id: string,
  iso_day: string
) {
  await select_reserva(user, quarto_id, iso_day)
  await user.click(screen.getByRole('button', { name: 'Check-in' }))
  return screen.findByRole('dialog', { name: 'Confirmar check-in' })
}

function watch_list_requests() {
  let count = 0
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/reservas') count += 1
  })
  return () => count
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 11, 1))
  vi.spyOn(toast, 'success').mockImplementation(() => 'id')
  vi.spyOn(toast, 'error').mockImplementation(() => 'id')
})

afterEach(() => {
  server.events.removeAllListeners()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Calendario - check-in da reserva selecionada (US2)', () => {
  it('shows the suite 102 as check-in and 101 as available from the loaded reservations', async () => {
    render_calendario()
    await wait_for_grid()

    expect(dot_of('102')).toHaveAttribute('data-status', 'checkin')
    expect(dot_of('101')).toHaveAttribute('data-status', 'disponivel')
  })

  it('checks in a confirmed reservation and updates bar, suite dot and button', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    const dialog = await open_check_in(user, QUARTO_101_ID, '2026-12-03')
    expect(within(dialog).getByText('Chegada tardia')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    )

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Check-in da reserva RES-0101 realizado com sucesso!'
      )
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(ultimo_corpo_alterar_status()).toEqual({ status: 'check_in' })
    await waitFor(() => {
      for (const bar of bars_of('reserva-101')) {
        expect(bar).toHaveAttribute('data-status', 'check_in')
        expect(bar).toHaveAttribute('aria-pressed', 'true')
      }
      expect(dot_of('101')).toHaveAttribute('data-status', 'checkin')
    })
    expect(screen.getByRole('button', { name: 'Check-in' })).toBeDisabled()
  })

  it('does not send any request when cancelling and keeps the selection', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    const dialog = await open_check_in(user, QUARTO_101_ID, '2026-12-03')

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(ultimo_corpo_alterar_status()).toBeNull()
    for (const bar of bars_of('reserva-101')) {
      expect(bar).toHaveAttribute('aria-pressed', 'true')
    }
  })

  it('closes only the modal with Escape, keeping the reservation selected', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    await open_check_in(user, QUARTO_101_ID, '2026-12-03')

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    for (const bar of bars_of('reserva-101')) {
      expect(bar).toHaveAttribute('aria-pressed', 'true')
    }
  })

  it('shows the API message, closes the modal and reloads the reservations on 422', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json({ message: 'Transição inválida' }, { status: 422 })
      )
    )
    const dialog = await open_check_in(user, QUARTO_101_ID, '2026-12-03')
    const list_requests = watch_list_requests()

    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    )

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Transição inválida')
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(list_requests()).toBeGreaterThan(0))
  })

  it('shows "Reserva não encontrada." and clears the selection on 404', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json(
          { message: 'Reserva não encontrada.' },
          { status: 404 }
        )
      )
    )
    const dialog = await open_check_in(user, QUARTO_101_ID, '2026-12-03')

    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    )

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Reserva não encontrada.')
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    for (const bar of bars_of('reserva-101')) {
      expect(bar).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('keeps the modal open on a server error', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json({ message: 'Falha interna' }, { status: 500 })
      )
    )
    const dialog = await open_check_in(user, QUARTO_101_ID, '2026-12-03')

    await user.click(
      within(dialog).getByRole('button', { name: 'Confirmar check-in' })
    )

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(
      screen.getByRole('dialog', { name: 'Confirmar check-in' })
    ).toBeInTheDocument()
  })
})

describe('Calendario - check-in com fichas FNRH pendentes (US3)', () => {
  function probe_text() {
    return screen.getByTestId('location-probe').textContent
  }

  it('checks in and navigates to the reservation with fnrh=pendente when choosing to fill the forms', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    const dialog = await open_check_in(user, QUARTO_102_ID, '2026-12-02')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in e preencher FNRHs',
      })
    )

    await waitFor(() =>
      expect(probe_text()).toBe('/reservas/reserva-102?fnrh=pendente')
    )
    expect(ultimo_corpo_alterar_status()).toEqual({ status: 'check_in' })
    expect(toast.success).toHaveBeenCalledWith(
      'Check-in da reserva RES-0102 realizado com sucesso!'
    )
  })

  it('does not navigate when the check-in fails with 422', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    server.use(
      http.patch(`${BASE_URL}/reservas/:id/status`, () =>
        HttpResponse.json({ message: 'Transição inválida' }, { status: 422 })
      )
    )
    const dialog = await open_check_in(user, QUARTO_102_ID, '2026-12-02')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in e preencher FNRHs',
      })
    )

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(probe_text()).toBe('/reservas/calendario')
  })

  it('stays on the calendar when choosing to check in without filling', async () => {
    const user = make_user()
    render_calendario()
    await wait_for_grid()
    const dialog = await open_check_in(user, QUARTO_102_ID, '2026-12-02')

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Fazer check-in sem preencher',
      })
    )

    await waitFor(() => {
      for (const bar of bars_of('reserva-102')) {
        expect(bar).toHaveAttribute('data-status', 'check_in')
      }
    })
    expect(probe_text()).toBe('/reservas/calendario')
  })
})
