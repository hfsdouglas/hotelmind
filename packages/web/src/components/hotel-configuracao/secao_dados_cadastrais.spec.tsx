import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoDadosCadastrais } from './secao_dados_cadastrais'

const render = (o = {}) =>
  renderSecao(f => <SecaoDadosCadastrais form={f} />, o)

describe('SecaoDadosCadastrais', () => {
  it('mostra os dados cadastrais atuais do hotel', () => {
    render()

    expect(screen.getByLabelText(/nome corporativo/i)).toHaveValue(
      'Hotel Central SA'
    )
    expect(screen.getByLabelText(/nome fantasia/i)).toHaveValue('Hotel Central')
    expect(screen.getByLabelText(/razão social/i)).toHaveValue(
      'Hotel Central LTDA'
    )
    expect(screen.getByLabelText(/cnpj/i)).toHaveValue('12345678000190')
    expect(screen.getByLabelText(/e-mail comercial/i)).toHaveValue(
      'contato@hotelcentral.com.br'
    )
    expect(screen.getByLabelText(/telefone comercial/i)).toHaveValue(
      '1133334444'
    )
  })

  it('atualiza o nome fantasia no formulário ao digitar', async () => {
    const { getValues } = render()
    const input = screen.getByLabelText(/nome fantasia/i)

    await userEvent.clear(input)
    await userEvent.type(input, 'Novo Nome')

    expect(getValues().nome_fantasia).toBe('Novo Nome')
  })

  it('grava null em celular e website quando os campos são limpos', async () => {
    const { getValues } = render({
      celular: '11988887777',
      website: 'https://hotel.com',
    })

    await userEvent.clear(screen.getByLabelText(/celular/i))
    await userEvent.clear(screen.getByLabelText(/website/i))

    expect(getValues().celular).toBeNull()
    expect(getValues().website).toBeNull()
  })

  it('permite trocar a categoria do estabelecimento', async () => {
    const { getValues } = render({ categoria: 'HOTEL' })

    await userEvent.click(
      screen.getByRole('combobox', { name: /categoria do estabelecimento/i })
    )
    await userEvent.click(
      await screen.findByRole('option', { name: 'Pousada' })
    )

    expect(getValues().categoria).toBe('POUSADA')
  })

  it('converte a classificação de estrelas selecionada para número', async () => {
    const { getValues } = render({ classificacao_estrelas: 3 })

    await userEvent.click(
      screen.getByRole('combobox', { name: /classificação de estrelas/i })
    )
    await userEvent.click(
      await screen.findByRole('option', { name: '5 Estrelas' })
    )

    expect(getValues().classificacao_estrelas).toBe(5)
  })
})
