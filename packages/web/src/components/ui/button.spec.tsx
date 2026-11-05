import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders button text and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Clique Aqui</Button>)
    const button = screen.getByRole('button', { name: 'Clique Aqui' })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders disabled state and prevents click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button disabled onClick={onClick}>
        Desabilitado
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Desabilitado' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders different variants', () => {
    const { container } = render(<Button variant="destructive">Excluir</Button>)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })
})
