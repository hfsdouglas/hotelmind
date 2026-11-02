import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { UsuariosPage } from './index'

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: () => ({ data: { data: [], meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 } } }),
}))

describe('UsuariosPage suspense integration', () => {
  it('renders the searchable page and its empty result inside the boundary', () => {
    render(<UsuariosPage />, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> })
    expect(screen.getByRole('heading', { name: /usuários/i })).toBeInTheDocument()
    expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument()
  })
})
