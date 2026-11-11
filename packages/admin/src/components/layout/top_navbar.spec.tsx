import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TopNavbar } from './top_navbar'

describe('TopNavbar', () => {
  it('renders SuiteSync Admin logo linking to / and calls onMenuToggle on click', async () => {
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
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
    const button = screen.getByRole('button')
    await user.click(button)

    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })
})
