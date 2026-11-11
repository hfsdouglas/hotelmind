import type { QuartoDisponivel } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModalConflitoReserva } from './modal_conflito_reserva'

const makeQuarto = (
  over: Partial<QuartoDisponivel> = {}
): QuartoDisponivel => ({
  quarto_id: 'q-1',
  identificacao: '101',
  categoria_nome: 'Luxo',
  limite_hospedes: 2,
  valor_total: '1500',
  ...over,
})

function setup(alternativas: QuartoDisponivel[]) {
  const onOpenChange = vi.fn()
  const onSelectAlternativa = vi.fn()
  render(
    <ModalConflitoReserva
      open
      onOpenChange={onOpenChange}
      mensagem="A suíte já está reservada."
      alternativas={alternativas}
      onSelectAlternativa={onSelectAlternativa}
    />
  )
  return { onOpenChange, onSelectAlternativa }
}

describe('ModalConflitoReserva', () => {
  it('exibe titulo e mensagem do conflito', () => {
    setup([])

    expect(
      screen.getByText('Suíte com Conflito no Período')
    ).toBeInTheDocument()
    expect(screen.getByText('A suíte já está reservada.')).toBeInTheDocument()
  })

  it('nao exibe lista de alternativas quando vazia', () => {
    setup([])

    expect(
      screen.queryByText(/suítes alternativas disponíveis/i)
    ).not.toBeInTheDocument()
  })

  it('lista alternativas com categoria e valor em reais', () => {
    setup([
      makeQuarto(),
      makeQuarto({
        quarto_id: 'q-2',
        identificacao: '202',
        categoria_nome: 'Standard',
        valor_total: '900.5',
      }),
    ])

    expect(screen.getByRole('button', { name: /Suíte 101/ })).toHaveTextContent(
      /Luxo.*R\$\s?1\.500,00/
    )
    expect(screen.getByRole('button', { name: /Suíte 202/ })).toHaveTextContent(
      /Standard.*R\$\s?900,50/
    )
  })

  it('chama onSelectAlternativa com a suite escolhida', async () => {
    const user = userEvent.setup()
    const q2 = makeQuarto({ quarto_id: 'q-2', identificacao: '202' })
    const { onSelectAlternativa } = setup([makeQuarto(), q2])

    await user.click(screen.getByRole('button', { name: /Suíte 202/ }))

    expect(onSelectAlternativa).toHaveBeenCalledWith(q2)
  })

  it('fecha ao clicar em Fechar sem selecionar alternativa', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onSelectAlternativa } = setup([makeQuarto()])

    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onSelectAlternativa).not.toHaveBeenCalled()
  })
})
