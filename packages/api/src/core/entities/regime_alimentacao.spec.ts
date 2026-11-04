import { describe, expect, it } from 'vitest'
import { RegimeAlimentacaoValidationError } from '@/core/errors/regime_alimentacao_errors'
import { RegimeAlimentacao } from './regime_alimentacao'

describe('RegimeAlimentacao Entity', () => {
  const valid_props = {
    id: 'regime-1',
    hotel_id: 'hotel-1',
    titulo: 'Pensão Completa',
    descricao: 'Café da manhã, almoço e jantar inclusos',
    cor_pulseira: '#22c55e',
    ativo: true,
    criado_em: new Date('2026-01-01T10:00:00Z'),
    atualizado_em: new Date('2026-01-01T10:00:00Z'),
  }

  it('creates a valid regime alimentacao entity', () => {
    const regime = new RegimeAlimentacao(valid_props)
    expect(regime.id).toBe('regime-1')
    expect(regime.hotel_id).toBe('hotel-1')
    expect(regime.titulo).toBe('Pensão Completa')
    expect(regime.descricao).toBe('Café da manhã, almoço e jantar inclusos')
    expect(regime.cor_pulseira).toBe('#22C55E')
    expect(regime.ativo).toBe(true)
  })

  it('throws error when titulo is empty', () => {
    expect(
      () =>
        new RegimeAlimentacao({
          ...valid_props,
          titulo: '   ',
        })
    ).toThrow(RegimeAlimentacaoValidationError)
  })

  it('throws error when cor_pulseira is invalid hex', () => {
    expect(
      () =>
        new RegimeAlimentacao({
          ...valid_props,
          cor_pulseira: 'not-a-color',
        })
    ).toThrow(RegimeAlimentacaoValidationError)
  })

  it('allows activating and deactivating', () => {
    const regime = new RegimeAlimentacao(valid_props)
    regime.desativar()
    expect(regime.ativo).toBe(false)
    regime.ativar()
    expect(regime.ativo).toBe(true)
  })
})
