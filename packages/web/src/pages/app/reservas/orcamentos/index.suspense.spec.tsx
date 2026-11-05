import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { OrcamentosPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
  useMutation: () => ({
    mutate: vi.fn(),
  }),
  useQuery: () => ({ data: { data: [] } }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('OrcamentosPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<OrcamentosPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(
      screen.getByRole('heading', { name: /orçamentos de reserva/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhum orçamento encontrado.')).toBeInTheDocument()
  })
})
