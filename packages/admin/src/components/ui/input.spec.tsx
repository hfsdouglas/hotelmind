import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('renders input and accepts typing', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Buscar hotel..." />)

    const input = screen.getByPlaceholderText('Buscar hotel...')
    expect(input).toBeInTheDocument()

    await user.type(input, 'Grand Palace')
    expect(input).toHaveValue('Grand Palace')
  })

  it('renders disabled input', () => {
    render(<Input disabled placeholder="Desabilitado" />)
    expect(screen.getByPlaceholderText('Desabilitado')).toBeDisabled()
  })
})
