import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders button text and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Ação Admin</Button>)
    const button = screen.getByRole('button', { name: 'Ação Admin' })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders disabled state', () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByRole('button', { name: 'Desabilitado' })).toBeDisabled()
  })

  it('renders different variants', () => {
    const { container } = render(<Button variant="outline">Cancelar</Button>)
    expect(container.firstChild).toHaveClass('border')
  })
})
