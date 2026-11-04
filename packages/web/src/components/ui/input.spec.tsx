import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('renders input with value and handles change', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Digite seu nome" />)

    const input = screen.getByPlaceholderText('Digite seu nome')
    expect(input).toBeInTheDocument()

    await user.type(input, 'Douglas')
    expect(input).toHaveValue('Douglas')
  })

  it('renders disabled input', () => {
    render(<Input disabled placeholder="Bloqueado" />)
    expect(screen.getByPlaceholderText('Bloqueado')).toBeDisabled()
  })
})
