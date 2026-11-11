import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModalAlterarStatusReserva } from './modal_alterar_status_reserva'

function setup(
  novoStatus: 'cancelada' | 'no_show' | null = 'cancelada',
  open = true
) {
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn()
  render(
    <ModalAlterarStatusReserva
      open={open}
      novoStatus={novoStatus}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  )
  return { onOpenChange, onConfirm }
}

describe('ModalAlterarStatusReserva', () => {
  it('nao renderiza o dialogo quando fechado', () => {
    setup('cancelada', false)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('pede confirmacao para Cancelada', () => {
    setup('cancelada')

    expect(
      screen.getByRole('alertdialog', {
        name: 'Confirmar alteração para Cancelada?',
      })
    ).toBeInTheDocument()
  })

  it('pede confirmacao para No-show nos demais status', () => {
    setup('no_show')

    expect(
      screen.getByText('Confirmar alteração para No-show?')
    ).toBeInTheDocument()
  })

  it('chama onConfirm ao confirmar', async () => {
    const user = userEvent.setup()
    const { onConfirm } = setup()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('fecha sem confirmar ao clicar em Voltar', async () => {
    const user = userEvent.setup()
    const { onConfirm, onOpenChange } = setup()

    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
