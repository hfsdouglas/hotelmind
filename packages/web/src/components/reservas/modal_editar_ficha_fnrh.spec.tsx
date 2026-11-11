import type { ReservaHospede } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalEditarFichaFnrh } from './modal_editar_ficha_fnrh'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

const makeHospede = (over: Record<string, unknown> = {}) =>
  ({
    id: 'h-1',
    posicao: 1,
    nome_completo: 'Ana Souza',
    cidade: 'Campinas',
    estado: 'SP',
    logradouro: 'Rua A',
    numero_endereco: '10',
    bairro: 'Centro',
    cep: '13000-000',
    ...over,
  }) as unknown as ReservaHospede

function setup(
  props: {
    hospede?: ReservaHospede | null
    hospedePrincipal?: ReservaHospede | null
    isPending?: boolean
  } = {}
) {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn()
  render(
    <ModalEditarFichaFnrh
      open
      hospede={props.hospede === undefined ? makeHospede() : props.hospede}
      hospedePrincipal={props.hospedePrincipal}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isPending={props.isPending ?? false}
    />
  )
  return { onOpenChange, onSubmit }
}

describe('ModalEditarFichaFnrh', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe titulo de titular e preenche o formulario com dados existentes', () => {
    setup()

    expect(
      screen.getByRole('dialog', { name: 'Ficha FNRH - Hóspede Titular' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome Completo *')).toHaveValue('Ana Souza')
    expect(screen.getByLabelText('Cidade *')).toHaveValue('Campinas')
    expect(screen.getByLabelText('Nacionalidade *')).toHaveValue('Brasileira')
    expect(screen.getByLabelText('País *')).toHaveValue('Brasil')
  })

  it('exibe titulo com a posicao para demais hospedes', () => {
    setup({ hospede: makeHospede({ posicao: 3 }) })

    expect(
      screen.getByRole('dialog', { name: 'Ficha FNRH - Hóspede 3' })
    ).toBeInTheDocument()
  })

  it('aplica mascara ao digitar o telefone', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(
      screen.getByLabelText('Celular / WhatsApp *'),
      '11999998888'
    )

    expect(screen.getByLabelText('Celular / WhatsApp *')).toHaveValue(
      '(11) 99999-8888'
    )
  })

  it('salva rascunho com concluir falso e a posicao do hospede', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await user.clear(screen.getByLabelText('Profissão *'))
    await user.type(screen.getByLabelText('Profissão *'), 'Médica')
    await user.click(screen.getByRole('button', { name: 'Salvar Rascunho' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.posicao).toBe(1)
    expect(arg.data).toMatchObject({
      nome_completo: 'Ana Souza',
      profissao: 'Médica',
      concluir: false,
    })
  })

  it('conclui a ficha com concluir verdadeiro', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup({ hospede: makeHospede({ posicao: 2 }) })

    await user.click(screen.getByRole('button', { name: 'Concluir Ficha' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        posicao: 2,
        data: expect.objectContaining({ concluir: true }),
      })
    )
  })

  it('desabilita botoes e mostra Salvando enquanto pendente', () => {
    setup({ isPending: true })

    expect(
      screen.getByRole('button', { name: 'Salvar Rascunho' })
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
  })

  it('nao submete quando nao ha hospede selecionado', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup({ hospede: null })

    await user.click(screen.getByRole('button', { name: 'Concluir Ficha' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('nao oferece copiar endereco para o titular', () => {
    setup()

    expect(
      screen.queryByRole('button', { name: /copiar do hóspede principal/i })
    ).not.toBeInTheDocument()
  })

  it('copia o endereco do hospede principal e mostra toast de sucesso', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup({
      hospede: makeHospede({
        id: 'h-2',
        posicao: 2,
        cidade: '',
        estado: '',
        logradouro: '',
        numero_endereco: '',
        bairro: '',
        cep: '',
      }),
      hospedePrincipal: makeHospede({ complemento: 'Apto 5' }),
    })

    await user.click(
      screen.getByRole('button', { name: /copiar do hóspede principal/i })
    )

    expect(screen.getByLabelText('Logradouro / Rua *')).toHaveValue('Rua A')
    expect(screen.getByLabelText('Cidade *')).toHaveValue('Campinas')
    expect(screen.getByLabelText('Estado / UF *')).toHaveValue('SP')
    expect(screen.getByLabelText('CEP')).toHaveValue('13000-000')
    expect(screen.getByLabelText('Complemento')).toHaveValue('Apto 5')
    expect(toast.success).toHaveBeenCalledWith(
      'Endereço do hóspede principal copiado com sucesso!'
    )

    await user.click(screen.getByRole('button', { name: 'Salvar Rascunho' }))
    expect(onSubmit.mock.calls[0][0].data).toMatchObject({ bairro: 'Centro' })
  })

  it('exibe toast de erro ao copiar sem hospede principal', async () => {
    const user = userEvent.setup()
    setup({ hospede: makeHospede({ posicao: 2 }), hospedePrincipal: null })

    await user.click(
      screen.getByRole('button', { name: /copiar do hóspede principal/i })
    )

    expect(toast.error).toHaveBeenCalledWith(
      'Dados do hóspede principal não disponíveis.'
    )
    expect(toast.success).not.toHaveBeenCalled()
  })
})
