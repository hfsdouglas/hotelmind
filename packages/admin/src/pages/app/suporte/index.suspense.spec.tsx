import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SuportePage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [] }),
  useSuspenseQuery: () => ({
    data: {
      data: [],
      meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 },
    },
  }),
}))

describe('SuportePage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<SuportePage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(
      screen.getByRole('heading', { name: /suporte/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
  })
})
