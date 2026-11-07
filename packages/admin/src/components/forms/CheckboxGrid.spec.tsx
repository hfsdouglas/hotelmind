import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CheckboxGrid } from './CheckboxGrid'

const items = [
  { id: '1', label: 'Dashboard' },
  { id: '2', label: 'Hotéis' },
  { id: '3', label: 'Rotas' },
]

describe('CheckboxGrid', () => {
  it('renders one checkbox per item in a grid', () => {
    render(
      <CheckboxGrid items={items} selectedIds={new Set()} onToggle={vi.fn()} />
    )
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Hotéis')).toBeInTheDocument()
    expect(screen.getByText('Rotas')).toBeInTheDocument()
  })

  it('marks items present in selectedIds as checked', () => {
    render(
      <CheckboxGrid
        items={items}
        selectedIds={new Set(['2'])}
        onToggle={vi.fn()}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toHaveAttribute('data-state', 'checked')
    expect(checkboxes[0]).toHaveAttribute('data-state', 'unchecked')
  })

  it('calls onToggle with the item id when a checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <CheckboxGrid items={items} selectedIds={new Set()} onToggle={onToggle} />
    )
    await user.click(screen.getAllByRole('checkbox')[0])
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('renders the empty message instead of the grid when items is empty', () => {
    render(
      <CheckboxGrid
        items={[]}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        emptyMessage="Nenhuma opção disponível."
      />
    )
    expect(screen.getByText('Nenhuma opção disponível.')).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })
})
