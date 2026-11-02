import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RotasPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useSuspenseQuery: () => ({ data: { data: [], meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 } } }),
}))

describe('RotasPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<RotasPage />, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> })
    expect(screen.getByRole('heading', { name: /rotas/i })).toBeInTheDocument()
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
  })
})
