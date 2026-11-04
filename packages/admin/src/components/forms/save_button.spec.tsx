import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SaveButton } from './save_button'

describe('SaveButton (Admin)', () => {
  it('renders with floppy disk icon and default "Salvar" text', () => {
    render(<SaveButton />)

    const button = screen.getByRole('button', { name: /Salvar/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'submit')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('renders pending state with "Salvando..." and disabled attribute', () => {
    render(<SaveButton isPending />)

    const button = screen.getByRole('button', { name: /Salvando\.\.\./i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('allows customizing label and pendingLabel while preserving floppy disk icon', () => {
    render(<SaveButton label="Salvar alterações" pendingLabel="Atualizando..." />)

    const button = screen.getByRole('button', { name: /Salvar alterações/i })
    expect(button).toBeInTheDocument()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
