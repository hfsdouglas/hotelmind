import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ReservasPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { data: [] } }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('ReservasPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<ReservasPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(
      screen.getByRole('heading', { name: /gestão de reservas/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhuma reserva encontrada.')).toBeInTheDocument()
  })
})
