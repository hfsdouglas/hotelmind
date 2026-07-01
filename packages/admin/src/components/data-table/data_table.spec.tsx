import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from './data_table'

interface Row {
  id: string
  nome: string
  email: string
}

const columns: Column<Row>[] = [
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'email', label: 'E-mail', sortable: false },
]

const rows: Row[] = [
  { id: '1', nome: 'Hotel A', email: 'a@test.com' },
  { id: '2', nome: 'Hotel B', email: 'b@test.com' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('E-mail')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('Hotel A')).toBeInTheDocument()
    expect(screen.getByText('b@test.com')).toBeInTheDocument()
  })

  it('shows loading message when isLoading is true', () => {
    render(<DataTable columns={columns} rows={[]} isLoading />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows default empty message when rows is empty and not loading', () => {
    render(<DataTable columns={columns} rows={[]} />)
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(<DataTable columns={columns} rows={[]} emptyMessage="Sem hotéis cadastrados." />)
    expect(screen.getByText('Sem hotéis cadastrados.')).toBeInTheDocument()
  })

  it('renders actions column when renderActions is provided', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        renderActions={row => <button>Editar {row.nome}</button>}
      />,
    )
    expect(screen.getByText('Ações')).toBeInTheDocument()
    expect(screen.getByText('Editar Hotel A')).toBeInTheDocument()
  })

  it('calls onSort when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const on_sort = vi.fn()
    render(<DataTable columns={columns} rows={rows} onSort={on_sort} />)
    await user.click(screen.getByText('Nome'))
    expect(on_sort).toHaveBeenCalledWith('nome')
  })

  it('does not call onSort when a non-sortable header is clicked', async () => {
    const user = userEvent.setup()
    const on_sort = vi.fn()
    render(<DataTable columns={columns} rows={rows} onSort={on_sort} />)
    await user.click(screen.getByText('E-mail'))
    expect(on_sort).not.toHaveBeenCalled()
  })

  it('renders custom cell via render function', () => {
    const custom_columns: Column<Row>[] = [
      {
        key: 'nome',
        label: 'Nome',
        render: row => <strong data-testid="custom">{row.nome.toUpperCase()}</strong>,
      },
    ]
    render(<DataTable columns={custom_columns} rows={[rows[0]]} />)
    expect(screen.getByTestId('custom')).toHaveTextContent('HOTEL A')
  })
})
