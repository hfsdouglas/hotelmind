import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DataTablePagination } from './data_table_pagination'

function Example() {
  const [pagina, setPagina] = useState(2)
  const [limite, setLimite] = useState(50)
  return (
    <div className="w-[640px]">
      <DataTablePagination
        pagina={pagina}
        limite={limite}
        ultima_pagina={5}
        onPageChange={setPagina}
        onLimitChange={setLimite}
      />
    </div>
  )
}

const meta = {
  title: 'Patterns/DataTablePagination',
  component: Example,
} satisfies Meta<typeof Example>

export default meta
export const Default: StoryObj<typeof meta> = {}
