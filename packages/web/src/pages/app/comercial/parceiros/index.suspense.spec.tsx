import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ParceirosComerciaisPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { data: [] } }),
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('ParceirosComerciaisPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<ParceirosComerciaisPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(
      screen.getByRole('heading', { name: /parceiros comerciais/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Nenhum parceiro comercial encontrado.')
    ).toBeInTheDocument()
  })
})
