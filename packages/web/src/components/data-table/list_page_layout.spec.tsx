import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListPageLayout } from './list_page_layout'

describe('ListPageLayout', () => {
  it('renders title and children', () => {
    render(
      <ListPageLayout title="Usuários">
        <p>Conteúdo da tabela</p>
      </ListPageLayout>
    )

    expect(
      screen.getByRole('heading', { name: 'Usuários' })
    ).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da tabela')).toBeInTheDocument()
  })

  it('renders action, searchBar and filters when provided', () => {
    render(
      <ListPageLayout
        title="Usuários"
        action={<button type="button">Novo</button>}
        searchBar={<input placeholder="Buscar..." />}
        filters={<button type="button">Filtros</button>}
      >
        <div>Lista</div>
      </ListPageLayout>
    )

    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtros' })).toBeInTheDocument()
  })
})
