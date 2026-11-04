import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopNavbar } from './TopNavbar'

describe('TopNavbar', () => {
  it('renders title and calls onMenuToggle on click', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()

    render(<TopNavbar onMenuToggle={onMenuToggle} />)

    expect(screen.getByText('HotelMind Admin')).toBeInTheDocument()
    const button = screen.getByRole('button')
    await user.click(button)

    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })
})
