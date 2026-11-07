import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    render(
      <Checkbox
        aria-label="Permissão Admin"
        onCheckedChange={onCheckedChange}
      />
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Permissão Admin' })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders disabled state', () => {
    render(<Checkbox disabled aria-label="Desabilitado" />)
    expect(
      screen.getByRole('checkbox', { name: 'Desabilitado' })
    ).toBeDisabled()
  })
})
