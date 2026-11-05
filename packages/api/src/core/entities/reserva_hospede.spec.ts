import { describe, expect, it } from 'vitest'
import { ReservaValidationError } from '@/core/errors/reserva_errors'
import { ReservaHospede } from './reserva_hospede'

describe('ReservaHospede Entity', () => {
  const base_props = {
    id: 'hospede-1',
    reserva_id: 'reserva-1',
    posicao: 1,
    ficha_status: 'pendente' as const,
    nome_completo: 'Carlos Alberto',
    tipo_documento: 'cpf' as const,
    numero_documento: '12345678900',
  }

  it('deve instanciar um hóspede de reserva válido', () => {
    const hospede = new ReservaHospede(base_props)

    expect(hospede.id).toBe('hospede-1')
    expect(hospede.reserva_id).toBe('reserva-1')
    expect(hospede.posicao).toBe(1)
    expect(hospede.ficha_status).toBe('pendente')
    expect(hospede.nome_completo).toBe('Carlos Alberto')
  })

  it('deve lançar erro se reserva_id não for fornecido', () => {
    expect(
      () =>
        new ReservaHospede({
          ...base_props,
          reserva_id: '',
        })
    ).toThrow(ReservaValidationError)
  })

  it('deve lançar erro se posicao for menor que 1', () => {
    expect(
      () =>
        new ReservaHospede({
          ...base_props,
          posicao: 0,
        })
    ).toThrow(ReservaValidationError)
  })

  it('deve formatar data de nascimento caso seja passada como Date', () => {
    const hospede = new ReservaHospede({
      ...base_props,
      data_nascimento: new Date('1990-05-15T00:00:00.000Z'),
    })

    expect(hospede.data_nascimento).toBe('1990-05-15')
  })
})
