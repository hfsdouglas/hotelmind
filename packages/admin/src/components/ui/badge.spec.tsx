import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>Ativo</Badge>)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('renders outline variant', () => {
    const { container } = render(<Badge variant="outline">Inativo</Badge>)
    expect(container.firstChild).toHaveClass('text-foreground')
  })
})
