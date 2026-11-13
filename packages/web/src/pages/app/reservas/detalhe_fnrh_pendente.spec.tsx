import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DetalheReservaPage } from './[id]/index'

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  )
}

function render_detalhe(url: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <LocationProbe />
        <Routes>
          <Route path="/reservas/:id" element={<DetalheReservaPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function probe_text() {
  return screen.getByTestId('location-probe').textContent
}

async function wait_for_reserva(codigo: string) {
  await screen.findAllByText(codigo)
}

describe('DetalheReservaPage - ?fnrh=pendente (US3)', () => {
  it('opens the form of the first pending guest once and removes the parameter', async () => {
    render_detalhe('/reservas/reserva-102?fnrh=pendente')

    const dialog = await screen.findByRole('dialog', {
      name: /Ficha FNRH - Hóspede Titular/,
    })

    expect(dialog).toBeInTheDocument()
    await waitFor(() => expect(probe_text()).toBe('/reservas/reserva-102'))
  })

  it('does not reopen the form after closing it', async () => {
    const user = userEvent.setup()
    render_detalhe('/reservas/reserva-102?fnrh=pendente')
    await screen.findByRole('dialog', { name: /Ficha FNRH/ })
    await waitFor(() => expect(probe_text()).toBe('/reservas/reserva-102'))

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens nothing and removes the parameter when every form is filled', async () => {
    render_detalhe('/reservas/reserva-101?fnrh=pendente')
    await wait_for_reserva('RES-0101')

    await waitFor(() => expect(probe_text()).toBe('/reservas/reserva-101'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens nothing without the parameter', async () => {
    render_detalhe('/reservas/reserva-102')
    await wait_for_reserva('RES-0102')

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(probe_text()).toBe('/reservas/reserva-102')
  })
})

describe('DetalheReservaPage - selo de status (US6)', () => {
  it('shows the orange check-in badge for a reservation in check_in', async () => {
    render_detalhe('/reservas/reserva-104')
    await wait_for_reserva('RES-0104')

    const badges = await screen.findAllByText('Check-in')

    expect(
      badges.some(el => el.classList.contains('text-status-checkin-foreground'))
    ).toBe(true)
  })
})
