import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BarraAcoesFixa } from './barra_acoes_fixa'

describe('BarraAcoesFixa', () => {
  it('renders discard and save buttons', () => {
    render(<BarraAcoesFixa onDiscard={vi.fn()} isSubmitting={false} />)

    expect(
      screen.getByRole('button', { name: /descartar alterações/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /salvar alterações/i })
    ).toBeInTheDocument()
  })

  it('triggers onDiscard callback when discard button is clicked', async () => {
    const user = userEvent.setup()
    const handleDiscard = vi.fn()

    render(<BarraAcoesFixa onDiscard={handleDiscard} isSubmitting={false} />)

    await user.click(
      screen.getByRole('button', { name: /descartar alterações/i })
    )
    expect(handleDiscard).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when isSubmitting is true', () => {
    render(<BarraAcoesFixa onDiscard={vi.fn()} isSubmitting={true} />)

    expect(
      screen.getByRole('button', { name: /descartar alterações/i })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /salvando|salvar/i })
    ).toBeDisabled()
  })
})
