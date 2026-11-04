import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
  it('renders label with text and htmlFor attribute', () => {
    render(<Label htmlFor="email-input">E-mail</Label>)
    const label = screen.getByText('E-mail')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'email-input')
  })
})
