import { describe, expect, it } from 'vitest'
import { Reserva } from './reserva'
import { ReservaValidationError } from '@/core/errors/reserva_errors'

describe('Reserva Entity', () => {
  const base_props = {
    id: 'reserva-1',
    hotel_id: 'hotel-1',
    codigo: 'RES-0001',
    titular_nome: 'João da Silva',
    titular_telefone: '11999999999',
    titular_email: 'joao@email.com',
    quarto_id: 'quarto-1',
    regime_alimentacao_id: 'regime-1',
    check_in: '2026-12-01',
    check_out: '2026-12-05',
    quantidade_adultos: 2,
    quantidade_criancas: 1,
    valor_total: '1200.00',
    detalhamento_diarias: [
      {
        data: '2026-12-01',
        tarifario_id: 'tar-1',
        tarifario_nome: 'Tarifário Padrão',
        valor_diaria: '300.00',
      },
    ],
    status: 'confirmada' as const,
    token_fnrh: 'tok-123456',
    created_at: new Date('2026-11-01'),
    updated_at: new Date('2026-11-01'),
  }

  it('deve instanciar uma reserva válida corretamente', () => {
    const reserva = new Reserva(base_props)

    expect(reserva.id).toBe('reserva-1')
    expect(reserva.codigo).toBe('RES-0001')
    expect(reserva.titular_nome).toBe('João da Silva')
    expect(reserva.total_hospedes).toBe(3)
    expect(reserva.token_fnrh_ativo).toBe(true)
    expect(reserva.valor_total).toBe('1200.00')
  })

  it('deve lançar erro se o nome do titular for muito curto ou vazio', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          titular_nome: ' ',
        }),
    ).toThrow(ReservaValidationError)

    expect(
      () =>
        new Reserva({
          ...base_props,
          titular_nome: 'A',
        }),
    ).toThrow(ReservaValidationError)
  })

  it('deve validar e-mail inválido do titular se fornecido', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          titular_email: 'invalido-email',
        }),
    ).toThrow(ReservaValidationError)
  })

  it('deve lançar erro se o quarto_id não for informado', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          quarto_id: '',
        }),
    ).toThrow(ReservaValidationError)
  })

  it('deve lançar erro se as datas forem inválidas ou check_out anterior a check_in', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          check_in: 'data-invalida',
        }),
    ).toThrow(ReservaValidationError)

    expect(
      () =>
        new Reserva({
          ...base_props,
          check_in: '2026-12-10',
          check_out: '2026-12-05',
        }),
    ).toThrow(ReservaValidationError)
  })

  it('deve lançar erro se quantidade de adultos for menor que 1', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          quantidade_adultos: 0,
        }),
    ).toThrow(ReservaValidationError)
  })

  it('deve lançar erro se token da FNRH estiver ausente', () => {
    expect(
      () =>
        new Reserva({
          ...base_props,
          token_fnrh: '',
        }),
    ).toThrow(ReservaValidationError)
  })
})
