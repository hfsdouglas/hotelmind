import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ParceiroForm, type ParceiroFormState } from './parceiro_form'

function setup(props: Partial<React.ComponentProps<typeof ParceiroForm>> = {}) {
  const onSubmit = vi.fn()
  render(
    <MemoryRouter>
      <ParceiroForm
        title="Novo Parceiro"
        backTo="/parceiros"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>
  )
  return { onSubmit }
}

const salvar = () => screen.getByRole('button', { name: /salvar parceiro/i })

async function escolher(indice: number, opcao: RegExp) {
  await userEvent.click(screen.getAllByRole('combobox')[indice])
  await userEvent.click(await screen.findByRole('option', { name: opcao }))
}

describe('ParceiroForm', () => {
  it('renderiza título, link de voltar e botão de salvar', () => {
    setup()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Novo Parceiro' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/parceiros')
    expect(salvar()).toBeInTheDocument()
  })

  it('usa o rótulo de envio customizado', () => {
    setup({ submitLabel: 'Criar' })
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })

  it('mostra campos de PJ por padrão', () => {
    setup()

    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome fantasia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^cnpj/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/inscrição estadual/i)).toBeInTheDocument()
  })

  it('exige razão social antes de enviar', async () => {
    const { onSubmit } = setup()

    await userEvent.click(salvar())

    expect(screen.getByText('Razão social é obrigatória.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('exige CNPJ para parceiro nacional PJ', async () => {
    const { onSubmit } = setup()

    await userEvent.type(screen.getByLabelText(/razão social/i), 'Agência Sol')
    await userEvent.click(salvar())

    expect(screen.getByText('Informe um CNPJ válido.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('troca para PF ao selecionar agente autônomo e exige nome completo e CPF', async () => {
    const { onSubmit } = setup()

    await escolher(0, /agente autônomo/i)

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^cpf/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/nome fantasia/i)).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/nome completo/i), 'João')
    await userEvent.click(salvar())

    expect(screen.getByText('Informe um CPF válido.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('exige nome completo para PF sem nome', async () => {
    setup({
      initialData: { tipo_parceiro: 'agente_autonomo', tipo_pessoa: 'PF' },
    })

    await userEvent.click(salvar())

    expect(screen.getByText('Nome completo é obrigatório.')).toBeInTheDocument()
  })

  it('dispensa documento e oculta inscrição estadual para parceiro estrangeiro', async () => {
    const { onSubmit } = setup()

    await userEvent.type(screen.getByLabelText(/razão social/i), 'Foreign Ltd')
    await userEvent.click(
      screen.getByRole('checkbox', { name: /estrangeiro/i })
    )

    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/inscrição estadual/i)
    ).not.toBeInTheDocument()

    await userEvent.click(salvar())

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        razao_social: 'Foreign Ltd',
        estrangeiro: true,
        documento: null,
      })
    )
  })

  it('envia o payload normalizado (trim, nulos, UF maiúscula, país padrão)', async () => {
    const { onSubmit } = setup()

    await userEvent.type(
      screen.getByLabelText(/razão social/i),
      '  Agência Sol  '
    )
    await userEvent.type(screen.getByLabelText(/^cnpj/i), '12.345.678/0001-90')
    await userEvent.type(screen.getByLabelText(/^estado/i), 'sp')
    await userEvent.type(screen.getByLabelText(/cidade/i), ' Santos ')
    await userEvent.type(
      screen.getByPlaceholderText(/anotações internas/i),
      '  nota  '
    )
    await userEvent.click(salvar())

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload: ParceiroFormState = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Sol',
      nome_fantasia: null,
      documento: '12.345.678/0001-90',
      estado: 'SP',
      cidade: 'Santos',
      pais: 'Brasil',
      observacoes: 'nota',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
      comissao_padrao: 0,
      contatos: [],
    })
  })

  it('inclui regras comerciais e contatos editados no payload', async () => {
    const { onSubmit } = setup()

    await userEvent.type(screen.getByLabelText(/razão social/i), 'Agência Sol')
    await userEvent.type(screen.getByLabelText(/^cnpj/i), '123')
    await userEvent.type(screen.getByLabelText(/comissão padrão/i), '12')
    await userEvent.type(screen.getByLabelText(/^nome \*/i), 'Carlos')
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'c@x.com')
    await userEvent.type(screen.getByLabelText(/telefone/i), '1199')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    await userEvent.click(salvar())

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        comissao_padrao: 12,
        contatos: [
          expect.objectContaining({ nome: 'Carlos', email: 'c@x.com' }),
        ],
      })
    )
  })

  it('preenche os campos a partir de initialData (edição)', () => {
    setup({
      initialData: {
        tipo_parceiro: 'operadora_turismo',
        razao_social: 'Operadora Mar',
        documento: '99.999.999/0001-99',
        cidade: 'Recife',
        comissao_padrao: 8,
        contatos: [
          {
            tipo_contato: 'financeiro',
            nome: 'Ana',
            email: 'ana@x.com',
            telefone: '11',
            cargo: null,
          },
        ],
      },
    })

    expect(screen.getByLabelText(/razão social/i)).toHaveValue('Operadora Mar')
    expect(screen.getByLabelText(/^cnpj/i)).toHaveValue('99.999.999/0001-99')
    expect(screen.getByLabelText(/cidade/i)).toHaveValue('Recife')
    expect(screen.getByLabelText(/comissão padrão/i)).toHaveValue(8)
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('desabilita o botão de salvar enquanto envia', () => {
    setup({ isSubmitting: true })

    expect(screen.getByRole('button', { name: /salv/i })).toBeDisabled()
  })

  it('renderiza o botão de envio customizado quando fornecido', () => {
    setup({ submitButtonNode: <button type="submit">Gravar tudo</button> })

    expect(
      screen.getByRole('button', { name: 'Gravar tudo' })
    ).toBeInTheDocument()
  })
})
