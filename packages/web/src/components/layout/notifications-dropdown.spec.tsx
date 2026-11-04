import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { NotificationsDropdown } from './notifications-dropdown'

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
})
