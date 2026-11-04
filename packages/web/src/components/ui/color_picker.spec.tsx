import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorPicker } from './color_picker'

describe('ColorPicker', () => {
  it('renders presets and selects preset color on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<ColorPicker value="#2563EB" onChange={onChange} />)

    const verdeBtn = screen.getByRole('button', { name: /escolher cor verde/i })
    await user.click(verdeBtn)

    expect(onChange).toHaveBeenCalledWith('#16A34A')
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
})
