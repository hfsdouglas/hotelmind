import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoEstacionamentoWifi } from './secao_estacionamento_wifi'

const render = (o = {}) =>
  renderSecao(f => <SecaoEstacionamentoWifi form={f} />, o)

describe('SecaoEstacionamentoWifi', () => {
  describe('estacionamento', () => {
    it('oculta cobertura, valor e reserva prévia quando não possui estacionamento', () => {
      render({ tipo_estacionamento: 'NAO_POSSUI' })

      expect(
        screen.queryByLabelText(/cobertura das vagas/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/valor da diária/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('checkbox', { name: /reserva antecipada/i })
      ).not.toBeInTheDocument()
    })

    it('mostra cobertura e reserva prévia, sem valor, quando é gratuito', () => {
      render({ tipo_estacionamento: 'GRATUITO' })

      expect(screen.getByLabelText(/cobertura das vagas/i)).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /reserva antecipada/i })
      ).toBeInTheDocument()
      expect(
        screen.queryByLabelText(/valor da diária/i)
      ).not.toBeInTheDocument()
    })

    it('mostra e grava o valor da diária quando é pago no local', async () => {
      const { getValues } = render({ tipo_estacionamento: 'PAGO_LOCAL' })
      const valor = screen.getByLabelText(/valor da diária/i)

      await userEvent.type(valor, '35')
      expect(getValues().valor_diaria_estacionamento).toBe(35)

      await userEvent.clear(valor)
      expect(getValues().valor_diaria_estacionamento).toBeNull()
    })

    it('exibe campos adicionais ao trocar o tipo para pago no local', async () => {
      const { getValues } = render({ tipo_estacionamento: 'NAO_POSSUI' })

      await userEvent.click(
        screen.getByRole('combobox', { name: /tipo de estacionamento/i })
      )
      await userEvent.click(
        await screen.findByRole('option', { name: /pago no local/i })
      )

      expect(getValues().tipo_estacionamento).toBe('PAGO_LOCAL')
      expect(screen.getByLabelText(/valor da diária/i)).toBeInTheDocument()
    })

    it('alterna a necessidade de reserva antecipada da vaga', async () => {
      const { getValues } = render({ tipo_estacionamento: 'CONVENIADO' })

      await userEvent.click(
        screen.getByRole('checkbox', { name: /reserva antecipada/i })
      )

      expect(getValues().estacionamento_reserva_previa).toBe(true)
    })
  })

  describe('wi-fi', () => {
    it('oculta os campos de rede quando não disponibiliza wi-fi', () => {
      render({ possui_wifi: false })

      expect(screen.queryByLabelText(/nome da rede/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/senha da rede/i)).not.toBeInTheDocument()
      expect(
        screen.queryByRole('checkbox', { name: /exibir rede e senha/i })
      ).not.toBeInTheDocument()
    })

    it('exibe os campos de rede ao marcar que possui wi-fi', async () => {
      const { getValues } = render({ possui_wifi: false })

      await userEvent.click(
        screen.getByRole('checkbox', { name: /disponibiliza internet/i })
      )

      expect(getValues().possui_wifi).toBe(true)
      expect(screen.getByLabelText(/nome da rede/i)).toBeInTheDocument()
    })

    it('grava SSID e senha e converte vazio para null', async () => {
      const { getValues } = render()

      await userEvent.type(screen.getByLabelText(/nome da rede/i), 'Rede5G')
      await userEvent.type(screen.getByLabelText(/senha da rede/i), 'abc')
      expect(getValues().nome_rede_wifi).toBe('Rede5G')
      expect(getValues().senha_rede_wifi).toBe('abc')

      await userEvent.clear(screen.getByLabelText(/nome da rede/i))
      expect(getValues().nome_rede_wifi).toBeNull()
    })

    it('alterna a visibilidade da senha do wi-fi', async () => {
      render({ senha_rede_wifi: 'segredo' })
      const senha = screen.getByLabelText(/senha da rede/i)
      expect(senha).toHaveAttribute('type', 'password')

      await userEvent.click(
        screen.getByRole('button', { name: /exibir senha/i })
      )
      expect(senha).toHaveAttribute('type', 'text')

      await userEvent.click(
        screen.getByRole('button', { name: /ocultar senha/i })
      )
      expect(senha).toHaveAttribute('type', 'password')
    })

    it('permite escolher a modalidade de cobertura', async () => {
      const { getValues } = render()

      await userEvent.click(
        screen.getByRole('combobox', { name: /modalidade de cobertura/i })
      )
      await userEvent.click(
        await screen.findByRole('option', { name: /pago à parte/i })
      )

      expect(getValues().tipo_wifi).toBe('PAGO')
    })
  })
})
