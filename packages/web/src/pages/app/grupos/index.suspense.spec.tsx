import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GruposPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('GruposPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<GruposPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(screen.getByRole('heading', { name: /grupos/i })).toBeInTheDocument()
    expect(screen.getByText('Nenhum grupo encontrado.')).toBeInTheDocument()
  })
})
