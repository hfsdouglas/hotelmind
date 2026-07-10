import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="Descrição" />)
    expect(screen.getByLabelText('Descrição')).toBeInstanceOf(
      HTMLTextAreaElement,
    )
  })

  it('forwards the ref to the underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} aria-label="Descrição" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('merges a custom className with the default styles', () => {
    render(<Textarea aria-label="Descrição" className="custom-class" />)
    expect(screen.getByLabelText('Descrição')).toHaveClass('custom-class')
  })

  it('accepts and displays multi-line text', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Descrição" />)
    const textarea = screen.getByLabelText('Descrição')
    await user.type(textarea, 'Linha 1{enter}Linha 2')
    expect(textarea).toHaveValue('Linha 1\nLinha 2')
  })
})
