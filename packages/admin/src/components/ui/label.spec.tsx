import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
  it('renders label with text and htmlFor attribute', () => {
    render(<Label htmlFor="nome-input">Nome Completo</Label>)
    const label = screen.getByText('Nome Completo')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'nome-input')
  })
})
