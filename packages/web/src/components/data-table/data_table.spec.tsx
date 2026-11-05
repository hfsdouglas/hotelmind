import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type Column, DataTable } from './data_table'

interface Row {
  id: string
  nome: string
}

const columns: Column<Row>[] = [{ key: 'nome', header: 'Nome' }]

describe('DataTable', () => {
  it('keeps the configured column count in its loading row', () => {
    render(<DataTable columns={columns} data={[]} isLoading />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '1')
  })

  it('renders the empty state after loading ends', () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="Sem quartos." />
    )

    expect(screen.getByText('Sem quartos.')).toBeInTheDocument()
  })
})
