import { describe, expect, it } from 'vitest'
import { regimeAlimentacaoSchema } from './regime_alimentacao.schema'

describe('regimeAlimentacaoSchema', () => {
  it('validates a valid form data', () => {
    const data = {
      titulo: 'Pensão Completa',
      descricao: 'Café, almoço e jantar',
      cor_pulseira: '#22C55E',
      ativo: true,
    }

    const parsed = regimeAlimentacaoSchema.parse(data)
    expect(parsed.titulo).toBe('Pensão Completa')
    expect(parsed.cor_pulseira).toBe('#22C55E')
    expect(parsed.ativo).toBe(true)
  })

  it('fails when titulo is empty', () => {
    const data = {
      titulo: '   ',
      cor_pulseira: '#22C55E',
      ativo: true,
    }

    expect(() => regimeAlimentacaoSchema.parse(data)).toThrow(
      'O título é obrigatório.'
    )
  })

  it('fails when cor_pulseira is invalid', () => {
    const data = {
      titulo: 'All Inclusive',
      cor_pulseira: 'not-hex',
      ativo: true,
    }

    expect(() => regimeAlimentacaoSchema.parse(data)).toThrow(
      'A cor da pulseira deve ser um hexadecimal válido'
    )
  })
})
