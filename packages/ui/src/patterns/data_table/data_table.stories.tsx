import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../../components/button/button'
import { type Column, DataTable } from './data_table'

interface Quarto {
  id: string
  numero: string
  categoria: string
}

const data: Quarto[] = [
  { id: '1', numero: '101', categoria: 'Standard' },
  { id: '2', numero: '102', categoria: 'Luxo' },
  { id: '3', numero: '201', categoria: 'Suíte' },
]

const columns: Column<Quarto>[] = [
  { key: 'numero', header: 'Número', sortable: true },
  { key: 'categoria', header: 'Categoria', sortable: true },
  {
    key: 'acoes',
    header: '',
    render: row => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" aria-label={`Editar ${row.numero}`}>
          Editar
        </Button>
      </div>
    ),
  },
]

function Sortable() {
  const [sort, setSort] = useState<{ campo?: string; dir: 'asc' | 'desc' }>({
    dir: 'asc',
  })
  return (
    <DataTable
      columns={columns}
      data={data}
      ordenar_por={sort.campo}
      direcao={sort.dir}
      onSort={campo =>
        setSort(prev => ({
          campo,
          dir: prev.campo === campo && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
      }
    />
  )
}

const meta = {
  title: 'Patterns/DataTable',
  component: Sortable,
  decorators: [
    Story => (
      <div className="flex h-64 w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sortable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
}
