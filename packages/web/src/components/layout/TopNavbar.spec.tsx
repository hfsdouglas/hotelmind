import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TopNavbar } from './TopNavbar'

describe('TopNavbar', () => {
  it('renders SuiteSync logo linking to / and calls onMenuToggle when menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()

    render(
      <MemoryRouter>
        <TopNavbar onMenuToggle={onMenuToggle} />
      </MemoryRouter>
    )

    const logoLink = screen.getByRole('link', { name: /suitesync/i })
    expect(logoLink).toHaveAttribute('href', '/')
    expect(screen.getByText('Suite')).toBeInTheDocument()
    expect(screen.getByText('Sync')).toBeInTheDocument()

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    await user.click(menuButton)

    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })
})
