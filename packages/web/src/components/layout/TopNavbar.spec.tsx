import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopNavbar } from './TopNavbar'

describe('TopNavbar', () => {
  it('calls onMenuToggle when menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()

    render(<TopNavbar onMenuToggle={onMenuToggle} />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    await user.click(menuButton)

    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })
})
