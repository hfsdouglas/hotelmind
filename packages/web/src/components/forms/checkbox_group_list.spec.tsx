import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CheckboxGroupList } from './checkbox_group_list'

const groups = [
  { label: 'Dashboard', items: [{ id: '1', label: 'Dashboard' }] },
  {
    label: 'Reservas',
    items: [
      { id: '2', label: 'Listar reservas' },
      { id: '3', label: 'Nova reserva' },
    ],
  },
]

describe('CheckboxGroupList', () => {
  it('renders each group label as a heading', () => {
    render(
      <CheckboxGroupList
        groups={groups}
        selectedIds={new Set()}
        onToggle={vi.fn()}
      />
    )
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getByText('Reservas')).toBeInTheDocument()
  })

  it("stacks a group's routes vertically underneath its own heading, not beside another group", () => {
    render(
      <CheckboxGroupList
        groups={groups}
        selectedIds={new Set()}
        onToggle={vi.fn()}
      />
    )
    const reservasHeading = screen.getByText('Reservas')
    const groupBlock = reservasHeading.parentElement as HTMLElement
    expect(within(groupBlock).getByText('Listar reservas')).toBeInTheDocument()
    expect(within(groupBlock).getByText('Nova reserva')).toBeInTheDocument()
    expect(within(groupBlock).queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('marks items present in selectedIds as checked', () => {
    render(
      <CheckboxGroupList
        groups={groups}
        selectedIds={new Set(['2'])}
        onToggle={vi.fn()}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    const listarReservasCheckbox = screen
      .getByText('Listar reservas')
      .closest('label')!
      .querySelector('[role="checkbox"]')
    expect(listarReservasCheckbox).toHaveAttribute('data-state', 'checked')
    expect(checkboxes.length).toBe(3)
  })

  it('calls onToggle with the item id when a checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <CheckboxGroupList
        groups={groups}
        selectedIds={new Set()}
        onToggle={onToggle}
      />
    )
    await user.click(screen.getByText('Nova reserva'))
    expect(onToggle).toHaveBeenCalledWith('3')
  })

  it('renders groups in a responsive grid container', () => {
    const { container } = render(
      <CheckboxGroupList
        groups={groups}
        selectedIds={new Set()}
        onToggle={vi.fn()}
      />
    )
    expect(container.firstChild).toHaveClass('grid', 'lg:grid-cols-4')
  })

  it('renders the empty message instead of the grid when groups is empty', () => {
    render(
      <CheckboxGroupList
        groups={[]}
        selectedIds={new Set()}
        onToggle={vi.fn()}
        emptyMessage="Nenhuma rota disponível."
      />
    )
    expect(screen.getByText('Nenhuma rota disponível.')).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })
})
