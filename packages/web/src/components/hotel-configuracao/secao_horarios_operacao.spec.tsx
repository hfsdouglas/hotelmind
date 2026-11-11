import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoHorariosOperacao } from './secao_horarios_operacao'

const render = (o = {}) =>
  renderSecao(f => <SecaoHorariosOperacao form={f} />, o)

describe('SecaoHorariosOperacao', () => {
  it('mostra os horários de check-in e check-out atuais', () => {
    render({ horario_checkin: '15:00', horario_checkout: '11:00' })

    expect(screen.getByLabelText(/início do check-in/i)).toHaveValue('15:00')
    expect(screen.getByLabelText(/limite do check-out/i)).toHaveValue('11:00')
  })

  it('oculta os horários da recepção quando funciona 24h', () => {
    render({ recepcao_24h: true })

    expect(screen.getByRole('checkbox', { name: /24 horas/i })).toBeChecked()
    expect(
      screen.queryByLabelText(/abertura da recepção/i)
    ).not.toBeInTheDocument()
  })

  it('exibe horários de abertura e fechamento ao desmarcar 24h', async () => {
    const { getValues } = render({ recepcao_24h: true })

    await userEvent.click(screen.getByRole('checkbox', { name: /24 horas/i }))

    expect(getValues().recepcao_24h).toBe(false)
    expect(screen.getByLabelText(/abertura da recepção/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fechamento da recepção/i)).toBeInTheDocument()
  })

  it('grava o horário de abertura informado e null quando limpo', async () => {
    const { getValues } = render({
      recepcao_24h: false,
      horario_abertura_recepcao: '07:00',
    })
    const abertura = screen.getByLabelText(/abertura da recepção/i)
    expect(abertura).toHaveValue('07:00')

    await userEvent.clear(abertura)

    expect(getValues().horario_abertura_recepcao).toBeNull()
  })
})
