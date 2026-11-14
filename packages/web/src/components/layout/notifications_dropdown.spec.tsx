import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NotificationsDropdown } from './notifications_dropdown'

describe('NotificationsDropdown', () => {
  it('toggles notifications panel on button click', async () => {
    const user = userEvent.setup()
    render(<NotificationsDropdown />)

    const button = screen.getByRole('button', { name: 'Notificações' })
    expect(screen.queryByText('Nenhuma notificação.')).not.toBeInTheDocument()

    await user.click(button)
    expect(screen.getByText('Nenhuma notificação.')).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByText('Nenhuma notificação.')).not.toBeInTheDocument()
  })

  it('closes the panel with Esc', async () => {
    const user = userEvent.setup()
    render(<NotificationsDropdown />)

    await user.click(screen.getByRole('button', { name: 'Notificações' }))
    expect(screen.getByText('Nenhuma notificação.')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Nenhuma notificação.')).not.toBeInTheDocument()
  })

  it('announces the unread count in the accessible name', () => {
    render(<NotificationsDropdown count={4} />)

    expect(
      screen.getByRole('button', { name: /Notificações.*4 não lidas/ })
    ).toBeInTheDocument()
  })

  it('renders the sidebar variant with a visible label when expanded', () => {
    render(<NotificationsDropdown variant="sidebar" collapsed={false} />)

    expect(screen.getByText('Notificações')).not.toHaveClass('sr-only')
  })

  it('hides the label visually when the sidebar is collapsed', () => {
    render(<NotificationsDropdown variant="sidebar" collapsed />)

    expect(screen.getByText('Notificações')).toHaveClass('sr-only')
  })
})
