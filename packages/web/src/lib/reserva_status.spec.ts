import { describe, expect, it } from 'vitest'
import { make_calendario_reservation } from '@/tests/utils/make_calendario_reservation'
import { avaliar_check_in, is_check_in_antecipado } from './reserva_status'

describe('avaliar_check_in', () => {
  it('bloqueia quando não há reserva selecionada', () => {
    expect(avaliar_check_in(null)).toEqual({
      permitido: false,
      motivo: 'Selecione uma reserva para fazer check-in',
    })
  })

  it('bloqueia reserva a_confirmar pedindo confirmação', () => {
    expect(
      avaliar_check_in(make_calendario_reservation({ status: 'a_confirmar' }))
    ).toEqual({
      permitido: false,
      motivo: 'Confirme a reserva antes do check-in',
    })
  })

  it('bloqueia reserva que já está em check_in', () => {
    expect(
      avaliar_check_in(make_calendario_reservation({ status: 'check_in' }))
    ).toEqual({ permitido: false, motivo: 'Check-in já realizado' })
  })

  it('permite reserva confirmada', () => {
    expect(
      avaliar_check_in(make_calendario_reservation({ status: 'confirmada' }))
    ).toEqual({ permitido: true })
  })
})

describe('is_check_in_antecipado', () => {
  const hoje = new Date(2026, 11, 1)

  it('é true quando a entrada é depois de hoje', () => {
    expect(is_check_in_antecipado('2026-12-02T00:00:00', hoje)).toBe(true)
  })

  it('é false quando a entrada é hoje, ignorando a hora', () => {
    expect(
      is_check_in_antecipado('2026-12-01T00:00:00', new Date(2026, 11, 1, 18))
    ).toBe(false)
  })

  it('é false quando a entrada era em um dia anterior', () => {
    expect(is_check_in_antecipado('2026-11-30T00:00:00', hoje)).toBe(false)
  })
})
