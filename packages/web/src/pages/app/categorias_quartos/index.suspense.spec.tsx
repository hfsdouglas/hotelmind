import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CategoriasQuartosPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: () => ({ data: { data: [] } }),
}))

describe('CategoriasQuartosPage suspense integration', () => {
  it('renders the filtered page and its empty result inside the boundary', () => {
    render(<CategoriasQuartosPage />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    })
    expect(
      screen.getByRole('heading', { name: /categorias de quartos/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Nenhuma categoria cadastrada.')
    ).toBeInTheDocument()
  })
})
