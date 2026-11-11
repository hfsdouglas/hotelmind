import type { ParceiroContatoItem } from '@hotelmind/contracts'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContatosFormSection } from './contatos_form_section'

function makeContato(
  overrides: Partial<ParceiroContatoItem> = {}
): ParceiroContatoItem {
  return {
    tipo_contato: 'comercial',
    nome: 'Carlos Silva',
    email: 'carlos@exemplo.com',
    telefone: '11988887777',
    cargo: null,
    ...overrides,
  }
}

async function preencher(nome: string, email: string, telefone: string) {
  if (nome) await userEvent.type(screen.getByLabelText(/^nome/i), nome)
  if (email) await userEvent.type(screen.getByLabelText(/e-mail/i), email)
  if (telefone)
    await userEvent.type(screen.getByLabelText(/telefone/i), telefone)
}

describe('ContatosFormSection', () => {
  it('mostra mensagem de lista vazia quando não há contatos', () => {
    render(<ContatosFormSection contatos={[]} onChange={vi.fn()} />)

    expect(screen.getByText(/nenhum contato adicionado/i)).toBeInTheDocument()
  })

  it('lista os contatos existentes com tipo, dados e cargo', () => {
    render(
      <ContatosFormSection
        contatos={[
          makeContato({ cargo: 'Gerente' }),
          makeContato({ tipo_contato: 'financeiro', nome: 'Ana Souza' }),
          makeContato({ tipo_contato: 'operacional', nome: 'Rui Lima' }),
        ]}
        onChange={vi.fn()}
      />
    )

    expect(
      screen.queryByText(/nenhum contato adicionado/i)
    ).not.toBeInTheDocument()
    // 'Comercial' também aparece no valor padrão do Select (badge + select)
    expect(screen.getAllByText('Comercial')).toHaveLength(2)
    expect(screen.getByText('Financeiro')).toBeInTheDocument()
    expect(screen.getByText('Operacional')).toBeInTheDocument()
    expect(screen.getByText('Gerente')).toBeInTheDocument()
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
  })

  it('exibe erro e não adiciona quando faltam nome, e-mail ou telefone', async () => {
    const onChange = vi.fn()
    render(<ContatosFormSection contatos={[]} onChange={onChange} />)

    await preencher('Carlos', '', '')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(
      screen.getByText(/preencha ao menos nome, e-mail e telefone/i)
    ).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('não aceita campos preenchidos apenas com espaços', async () => {
    const onChange = vi.fn()
    render(<ContatosFormSection contatos={[]} onChange={onChange} />)

    await preencher('   ', 'a@b.com', '123')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('adiciona o contato (com trim e cargo nulo) e limpa os campos', async () => {
    const existente = makeContato({ nome: 'Existente' })
    const onChange = vi.fn()
    render(<ContatosFormSection contatos={[existente]} onChange={onChange} />)

    await preencher('  Maria  ', ' maria@x.com ', ' 1199 ')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(onChange).toHaveBeenCalledWith([
      existente,
      {
        tipo_contato: 'comercial',
        nome: 'Maria',
        email: 'maria@x.com',
        telefone: '1199',
        cargo: null,
      },
    ])
    expect(screen.getByLabelText(/^nome/i)).toHaveValue('')
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('')
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('')
  })

  it('adiciona o contato com o tipo e o cargo selecionados', async () => {
    const onChange = vi.fn()
    render(<ContatosFormSection contatos={[]} onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(
      await screen.findByRole('option', { name: /financeiro/i })
    )
    await preencher('Ana', 'ana@x.com', '11')
    await userEvent.type(screen.getByLabelText(/cargo/i), 'Diretora')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        tipo_contato: 'financeiro',
        nome: 'Ana',
        cargo: 'Diretora',
      }),
    ])
  })

  it('remove apenas o contato da linha clicada', async () => {
    const a = makeContato({ nome: 'Alfa' })
    const b = makeContato({ nome: 'Beta' })
    const onChange = vi.fn()
    render(<ContatosFormSection contatos={[a, b]} onChange={onChange} />)

    const linha = screen
      .getByText('Beta')
      .closest('div.justify-between') as HTMLElement
    await userEvent.click(within(linha).getByRole('button'))

    expect(onChange).toHaveBeenCalledWith([a])
  })
})
