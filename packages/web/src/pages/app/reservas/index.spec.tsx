import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ReservasPage } from './index'

describe('Reservas Index', () => {
  it('exports ReservasPage component correctly', () => {
    expect(ReservasPage).toBeDefined()
  })

  it('shows the orange check-in badge on the row of a reservation in check_in', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ReservasPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const link = await screen.findByRole('link', { name: 'RES-0104' })
    const row = link.closest('tr') as HTMLElement
    const badge = within(row).getByText('Check-in')

    expect(badge).toHaveClass('text-status-checkin-foreground')
  })
})
