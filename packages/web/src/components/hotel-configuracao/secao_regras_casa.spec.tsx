import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoRegrasCasa } from './secao_regras_casa'

const render = (o = {}) => renderSecao(f => <SecaoRegrasCasa form={f} />, o)

describe('SecaoRegrasCasa', () => {
  it('oculta o peso máximo quando o hotel não aceita pets', () => {
    render({ aceita_pets: false })

    expect(
      screen.getByRole('checkbox', { name: /pet friendly/i })
    ).not.toBeChecked()
    expect(screen.queryByLabelText(/peso máximo/i)).not.toBeInTheDocument()
  })

  it('exibe o peso máximo ao marcar que aceita pets e grava o valor numérico', async () => {
    const { getValues } = render()

    await userEvent.click(
      screen.getByRole('checkbox', { name: /pet friendly/i })
    )
    await userEvent.type(screen.getByLabelText(/peso máximo/i), '10')

    expect(getValues().aceita_pets).toBe(true)
    expect(getValues().peso_maximo_pet_kg).toBe(10)
  })

  it('grava null no peso máximo quando o campo é limpo', async () => {
    const { getValues } = render({ aceita_pets: true, peso_maximo_pet_kg: 8 })
    const peso = screen.getByLabelText(/peso máximo/i)
    expect(peso).toHaveValue(8)

    await userEvent.clear(peso)

    expect(getValues().peso_maximo_pet_kg).toBeNull()
  })

  it('alterna a permissão de fumar', async () => {
    const { getValues } = render({ permite_fumar: false })

    await userEvent.click(
      screen.getByRole('checkbox', { name: /permitido fumar/i })
    )

    expect(getValues().permite_fumar).toBe(true)
  })

  it('grava a taxa de higienização como número e null quando limpa', async () => {
    const { getValues } = render()
    const taxa = screen.getByLabelText(/taxa sanitária/i)

    await userEvent.type(taxa, '350')
    expect(getValues().taxa_higienizacao_fumo).toBe(350)

    await userEvent.clear(taxa)
    expect(getValues().taxa_higienizacao_fumo).toBeNull()
  })
})
