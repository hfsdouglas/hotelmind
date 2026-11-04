import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders badge content', () => {
    render(<Badge>Status Ativo</Badge>)
    expect(screen.getByText('Status Ativo')).toBeInTheDocument()
  })

  it('renders destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Erro</Badge>)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })
})
