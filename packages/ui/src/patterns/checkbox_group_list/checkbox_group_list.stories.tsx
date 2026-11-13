import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CheckboxGroupList } from './checkbox_group_list'

const groups = [
  {
    label: 'Reservas',
    items: [
      { id: '1', label: 'Listar' },
      { id: '2', label: 'Criar' },
    ],
  },
  { label: 'Tarifários', items: [{ id: '3', label: 'Listar' }] },
]

function Example() {
  const [selected, setSelected] = useState(new Set(['1']))
  return (
    <CheckboxGroupList
      groups={groups}
      selectedIds={selected}
      onToggle={id =>
        setSelected(prev => {
          const next = new Set(prev)
          next.has(id) ? next.delete(id) : next.add(id)
          return next
        })
      }
    />
  )
}

const meta = {
  title: 'Patterns/CheckboxGroupList',
  component: Example,
} satisfies Meta<typeof Example>

export default meta
export const Default: StoryObj<typeof meta> = {}
