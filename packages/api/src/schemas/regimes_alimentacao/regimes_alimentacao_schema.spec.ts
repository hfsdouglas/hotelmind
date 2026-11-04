import { describe, expect, it } from 'vitest'
import {
  create_regime_alimentacao_body_schema,
  hex_color_schema,
  update_regime_alimentacao_body_schema,
} from './regimes_alimentacao_schema'

describe('Regimes de Alimentação Schemas', () => {
  it('validates a correct payload for creation', () => {
    const input = {
      titulo: 'All Inclusive',
      descricao: 'Todas as refeições inclusas com bebidas',
      cor_pulseira: '#ff00aa',
    }

    const parsed = create_regime_alimentacao_body_schema.parse(input)
    expect(parsed.titulo).toBe('All Inclusive')
    expect(parsed.cor_pulseira).toBe('#FF00AA')
    expect(parsed.ativo).toBe(true)
  })

  it('rejects invalid hex color', () => {
    expect(() => hex_color_schema.parse('blue')).toThrow()
    expect(() => hex_color_schema.parse('#12345')).toThrow()
    expect(() => hex_color_schema.parse('123456')).toThrow()
  })

  it('accepts short 3-char hex colors and normalizes to upper', () => {
    expect(hex_color_schema.parse('#f00')).toBe('#F00')
  })

  it('validates an update payload', () => {
    const input = {
      titulo: 'Pensão Completa',
      descricao: null,
      cor_pulseira: '#22c55e',
      ativo: false,
    }

    const parsed = update_regime_alimentacao_body_schema.parse(input)
    expect(parsed.ativo).toBe(false)
    expect(parsed.descricao).toBeNull()
  })
})
