import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WristbandColorPicker } from './wristband_color_picker'

describe('WristbandColorPicker', () => {
  it('shows the wristband preview with the selected color', () => {
    render(<WristbandColorPicker value="#FF0000" onChange={vi.fn()} />)

    expect(screen.getByTestId('wristband-preview')).toBeInTheDocument()
    expect(screen.getByText('Pulseira de Identificação')).toBeInTheDocument()
  })

  it('uses wristband specific accessible labels', () => {
    render(<WristbandColorPicker value="#FF0000" onChange={vi.fn()} />)

    expect(
      screen.getByLabelText('Selecionar cor da pulseira')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Código hexadecimal da cor da pulseira')
    ).toBeInTheDocument()
  })

  it('notifies the typed hex color in upper case', async () => {
    const on_change = vi.fn()
    render(<WristbandColorPicker value="" onChange={on_change} />)

    await userEvent.type(
      screen.getByLabelText('Código hexadecimal da cor da pulseira'),
      'a'
    )

    expect(on_change).toHaveBeenLastCalledWith('#A')
  })
})
