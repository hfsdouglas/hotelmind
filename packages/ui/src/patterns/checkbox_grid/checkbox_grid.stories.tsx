import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CheckboxGrid } from './checkbox_grid'

const items = [
  { id: '1', label: 'Dashboard' },
  { id: '2', label: 'Reservas' },
  { id: '3', label: 'Tarifários' },
]

function Example() {
  const [selected, setSelected] = useState(new Set(['1']))
  return (
    <CheckboxGrid
      items={items}
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
  title: 'Patterns/CheckboxGrid',
  component: Example,
} satisfies Meta<typeof Example>

export default meta
export const Default: StoryObj<typeof meta> = {}
