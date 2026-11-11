import type { ParceiroComercial } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModalStatusParceiro } from './modal_status_parceiro'

function makeParceiro(
  overrides: Partial<ParceiroComercial> = {}
): ParceiroComercial {
  return {
    id: 'p-1',
    hotel_id: 'hotel-A',
    razao_social: 'Agência Sol LTDA',
    status: 'ativo',
    motivo_bloqueio: null,
    ...overrides,
  } as ParceiroComercial
}

function setup(
  props: Partial<React.ComponentProps<typeof ModalStatusParceiro>> = {}
) {
  const onConfirm = vi.fn().mockResolvedValue(undefined)
  const onOpenChange = vi.fn()
  render(
    <ModalStatusParceiro
      parceiro={makeParceiro()}
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isPending={false}
      {...props}
    />
  )
  return { onConfirm, onOpenChange }
}

const bloqueado = (motivo_bloqueio: string | null = null) =>
  makeParceiro({ status: 'bloqueado', motivo_bloqueio })

// Nota: a troca de status pelo Select dentro do Dialog entra em loop de foco
// (Radix FocusScope aninhado) no jsdom, por isso os cenarios de bloqueio
// partem de um parceiro ja bloqueado.

describe('ModalStatusParceiro', () => {
  it('mostra o título e a razão social do parceiro', () => {
    setup()

    expect(
      screen.getByRole('heading', { name: /alterar status do parceiro/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Agência Sol LTDA')).toBeInTheDocument()
  })

  it('não renderiza o conteúdo quando fechado', () => {
    setup({ open: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('confirma o status atual com motivo nulo e fecha o modal', async () => {
    const { onConfirm, onOpenChange } = setup()

    await userEvent.click(
      screen.getByRole('button', { name: /confirmar alteração/i })
    )

    expect(onConfirm).toHaveBeenCalledWith('ativo', null)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('oculta o campo de motivo quando o parceiro não está bloqueado', () => {
    setup()

    expect(
      screen.queryByLabelText(/motivo do bloqueio/i)
    ).not.toBeInTheDocument()
  })

  it('exige motivo para parceiro bloqueado e não chama onConfirm sem ele', async () => {
    const { onConfirm, onOpenChange } = setup({ parceiro: bloqueado() })

    await userEvent.type(screen.getByLabelText(/motivo do bloqueio/i), '   ')
    await userEvent.click(
      screen.getByRole('button', { name: /confirmar alteração/i })
    )

    expect(
      screen.getByText(/informe o motivo do bloqueio/i)
    ).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('envia o bloqueio com o motivo sem espaços nas bordas', async () => {
    const { onConfirm } = setup({ parceiro: bloqueado() })

    await userEvent.type(
      screen.getByLabelText(/motivo do bloqueio/i),
      '  Inadimplência '
    )
    await userEvent.click(
      screen.getByRole('button', { name: /confirmar alteração/i })
    )

    expect(onConfirm).toHaveBeenCalledWith('bloqueado', 'Inadimplência')
  })

  it('preenche status e motivo a partir do parceiro bloqueado', () => {
    setup({
      parceiro: makeParceiro({
        status: 'bloqueado',
        motivo_bloqueio: 'Documentação pendente',
      }),
    })

    expect(screen.getByLabelText(/motivo do bloqueio/i)).toHaveValue(
      'Documentação pendente'
    )
  })

  it('mostra a mensagem da API quando onConfirm falha e mantém o modal aberto', async () => {
    const { onOpenChange } = setup({
      onConfirm: vi.fn().mockRejectedValue({
        response: { data: { message: 'Sem permissão' } },
      }),
    })

    await userEvent.click(
      screen.getByRole('button', { name: /confirmar alteração/i })
    )

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('mostra mensagem genérica quando o erro não traz mensagem', async () => {
    setup({ onConfirm: vi.fn().mockRejectedValue(new Error('boom')) })

    await userEvent.click(
      screen.getByRole('button', { name: /confirmar alteração/i })
    )

    expect(
      await screen.findByText('Erro ao atualizar status.')
    ).toBeInTheDocument()
  })

  it('desabilita os botões e mostra "Salvando..." enquanto pendente', () => {
    setup({ isPending: true })

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
  })

  it('fecha o modal ao cancelar sem confirmar', async () => {
    const { onConfirm, onOpenChange } = setup()

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
