import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListPageLayout } from './list_page_layout'

describe('ListPageLayout', () => {
  it('renders title and children', () => {
    render(
      <ListPageLayout title="Administradores">
        <p>Conteúdo da tabela</p>
      </ListPageLayout>,
    )

    expect(screen.getByRole('heading', { name: 'Administradores' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da tabela')).toBeInTheDocument()
  })

  it('renders action, searchBar and filters when provided', () => {
    render(
      <ListPageLayout
        title="Hotéis"
        action={<button type="button">Novo Hotel</button>}
        searchBar={<input placeholder="Buscar hotel..." />}
        filters={<button type="button">Filtros</button>}
      >
        <div>Lista</div>
      </ListPageLayout>,
    )

    expect(screen.getByRole('button', { name: 'Novo Hotel' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar hotel...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtros' })).toBeInTheDocument()
  })
})
