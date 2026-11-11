import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  type RegrasComerciaisData,
  RegrasComerciaisFormSection,
} from './regras_comerciais_form_section'

function makeRegras(
  overrides: Partial<RegrasComerciaisData> = {}
): RegrasComerciaisData {
  return {
    modelo_tarifario: 'comissionada',
    comissao_padrao: 10,
    politica_faturamento: 'prepago',
    prazo_pagamento_dias: 30,
    limite_credito: 5000,
    allotment_quartos: 4,
    ...overrides,
  }
}

describe('RegrasComerciaisFormSection', () => {
  it('mostra os valores atuais das regras comerciais', () => {
    render(
      <RegrasComerciaisFormSection value={makeRegras()} onChange={vi.fn()} />
    )

    expect(screen.getByLabelText(/comissão padrão/i)).toHaveValue(10)
    expect(screen.getByLabelText(/prazo de pagamento/i)).toHaveValue(30)
    expect(screen.getByLabelText(/limite de crédito/i)).toHaveValue(5000)
    expect(screen.getByLabelText(/allotment/i)).toHaveValue(4)
    expect(screen.getByText('Tarifa Comissionada')).toBeInTheDocument()
    expect(screen.getByText(/pré-pago/i)).toBeInTheDocument()
  })

  it('emite o objeto atualizado ao alterar a comissão, preservando os demais campos', async () => {
    const value = makeRegras({ comissao_padrao: 0 })
    const onChange = vi.fn()
    render(<RegrasComerciaisFormSection value={value} onChange={onChange} />)

    await userEvent.type(screen.getByLabelText(/comissão padrão/i), '5')

    expect(onChange).toHaveBeenLastCalledWith({ ...value, comissao_padrao: 5 })
  })

  it('converte prazo e allotment para inteiros e limite para decimal', async () => {
    const value = makeRegras({
      prazo_pagamento_dias: 0,
      allotment_quartos: 0,
      limite_credito: 0,
    })
    const onChange = vi.fn()
    render(<RegrasComerciaisFormSection value={value} onChange={onChange} />)

    await userEvent.type(screen.getByLabelText(/prazo de pagamento/i), '7')
    expect(onChange).toHaveBeenLastCalledWith({
      ...value,
      prazo_pagamento_dias: 7,
    })

    await userEvent.type(screen.getByLabelText(/allotment/i), '3')
    expect(onChange).toHaveBeenLastCalledWith({
      ...value,
      allotment_quartos: 3,
    })

    await userEvent.click(screen.getByLabelText(/limite de crédito/i))
    await userEvent.paste('2.5')
    expect(onChange).toHaveBeenLastCalledWith({ ...value, limite_credito: 2.5 })
  })

  it('usa 0 quando o campo numérico é esvaziado', async () => {
    const value = makeRegras()
    const onChange = vi.fn()
    render(<RegrasComerciaisFormSection value={value} onChange={onChange} />)

    await userEvent.clear(screen.getByLabelText(/limite de crédito/i))

    expect(onChange).toHaveBeenLastCalledWith({ ...value, limite_credito: 0 })
  })

  it('emite o novo modelo tarifário selecionado', async () => {
    const value = makeRegras()
    const onChange = vi.fn()
    render(<RegrasComerciaisFormSection value={value} onChange={onChange} />)

    await userEvent.click(screen.getAllByRole('combobox')[0])
    await userEvent.click(
      await screen.findByRole('option', { name: /tarifa net/i })
    )

    expect(onChange).toHaveBeenCalledWith({ ...value, modelo_tarifario: 'net' })
  })

  it('emite a nova política de faturamento selecionada', async () => {
    const value = makeRegras()
    const onChange = vi.fn()
    render(<RegrasComerciaisFormSection value={value} onChange={onChange} />)

    await userEvent.click(screen.getAllByRole('combobox')[1])
    await userEvent.click(
      await screen.findByRole('option', { name: /faturado a prazo/i })
    )

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      politica_faturamento: 'faturado',
    })
  })
})
