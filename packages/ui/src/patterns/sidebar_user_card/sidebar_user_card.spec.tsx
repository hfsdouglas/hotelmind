import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogOut } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { SidebarUserCard } from './sidebar_user_card'

function renderCard(onSelect = vi.fn(), collapsed = false) {
  render(
    <SidebarUserCard
      name="Maria Souza"
      secondary="Hotel Luxo"
      collapsed={collapsed}
      items={[
        { id: 'tema', label: 'Modo escuro', onSelect },
        {
          id: 'sair',
          label: 'Sair',
          icon: LogOut,
          destructive: true,
          onSelect,
        },
      ]}
    />
  )
  return onSelect
}

describe('SidebarUserCard', () => {
  it('shows the name, secondary line and initials', () => {
    renderCard()

    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('Hotel Luxo')).toBeInTheDocument()
    expect(screen.getByText('MS')).toBeInTheDocument()
  })

  it('opens the menu by click and runs onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = renderCard()

    await user.click(screen.getByRole('button', { name: /Maria Souza/ }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Modo escuro' })
    )

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('opens the menu by keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = renderCard()

    screen.getByRole('button', { name: /Maria Souza/ }).focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('menu')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('marks the destructive item', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Maria Souza/ }))

    expect(
      await screen.findByRole('menuitem', { name: 'Sair' })
    ).toHaveAttribute('data-variant', 'destructive')
  })

  it('keeps the name accessible but hidden when collapsed', () => {
    renderCard(vi.fn(), true)

    expect(screen.getByText('Maria Souza')).toHaveClass('sr-only')
  })
})
