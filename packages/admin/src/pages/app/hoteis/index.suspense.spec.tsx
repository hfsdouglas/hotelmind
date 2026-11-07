import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HoteisPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('HoteisPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<HoteisPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(screen.getByRole('heading', { name: /hotéis/i })).toBeInTheDocument()
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
  })
})
