import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorPicker } from './color_picker'

describe('ColorPicker', () => {
  it('renders color swatch button and triggers native input on change', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#2563EB" onChange={onChange} />)

    const swatchBtn = screen.getByRole('button', {
      name: /cor selecionada: #2563EB/i,
    })
    expect(swatchBtn).toBeInTheDocument()
    expect(swatchBtn).toHaveStyle({ backgroundColor: '#2563EB' })

    const nativeInput = screen.getByLabelText(/selecionar cor/i)
    fireEvent.change(nativeInput, { target: { value: '#10B981' } })
    expect(onChange).toHaveBeenCalledWith('#10B981')
  })

  it('updates value when hex text input changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<ColorPicker value="#2563EB" onChange={onChange} />)

    const textInput = screen.getByPlaceholderText('#000000')
    await user.clear(textInput)
    await user.type(textInput, 'FF0000')

    expect(onChange).toHaveBeenCalled()
  })

  it('does not render suggested colors or wristband badge by default', () => {
    render(<ColorPicker value="#2563EB" onChange={() => {}} />)
    expect(screen.queryByTestId('wristband-preview')).not.toBeInTheDocument()
    expect(screen.queryByText(/cores sugeridas/i)).not.toBeInTheDocument()
  })

  it('renders wristband badge when showWristbandBadge is true', () => {
    render(
      <ColorPicker
        value="#2563EB"
        onChange={() => {}}
        showWristbandBadge={true}
      />
    )
    expect(screen.getByTestId('wristband-preview')).toBeInTheDocument()
    expect(screen.queryByText(/cores sugeridas/i)).not.toBeInTheDocument()
  })
})
