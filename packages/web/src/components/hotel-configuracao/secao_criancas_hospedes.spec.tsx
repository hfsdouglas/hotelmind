import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoCriancasHospedes } from './secao_criancas_hospedes'

const render = (o = {}) =>
  renderSecao(f => <SecaoCriancasHospedes form={f} />, o)

describe('SecaoCriancasHospedes', () => {
  it('mostra os limites atuais de gratuidade infantil', () => {
    render({
      limite_idade_crianca_gratis: 7,
      quantidade_max_criancas_gratis: 2,
    })

    expect(screen.getByLabelText(/idade limite/i)).toHaveValue(7)
    expect(screen.getByLabelText(/quantidade máxima/i)).toHaveValue(2)
  })

  it('converte a idade digitada para número no formulário', async () => {
    const { getValues } = render()
    const input = screen.getByLabelText(/idade limite/i)

    await userEvent.clear(input)
    await userEvent.type(input, '9')

    expect(getValues().limite_idade_crianca_gratis).toBe(9)
  })

  it('converte a quantidade máxima digitada para número no formulário', async () => {
    const { getValues } = render()
    const input = screen.getByLabelText(/quantidade máxima/i)

    await userEvent.clear(input)
    await userEvent.type(input, '3')

    expect(getValues().quantidade_max_criancas_gratis).toBe(3)
  })
})
