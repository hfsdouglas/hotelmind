import { describe, expect, it } from 'vitest'
import {
  Tarifario,
  cents_to_valor_diaria,
  is_valid_iso_date,
  normalize_valor_diaria,
  valor_diaria_to_cents,
} from './tarifario'

const base_props = {
  id: 'tarifario-1',
  hotel_id: 'hotel-1',
  categoria_quarto_id: 'cat-1',
  nome: '  Baixa temporada  ',
  data_inicio: '2027-03-01',
  data_fim: '2027-04-01',
  valor_diaria: '200',
  ativo: true,
  categoria_quarto: { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' as const },
  criado_em: '2026-11-02T12:00:00.000Z',
  atualizado_em: '2026-11-02T12:00:00.000Z',
}

describe('Tarifario entity', () => {
  it('creates a valid tarifario trimming name and normalizing decimal value', () => {
    const entity = new Tarifario(base_props)
    expect(entity.nome).toBe('Baixa temporada')
    expect(entity.valor_diaria).toBe('200.00')
    expect(entity.data_inicio).toBe('2027-03-01')
    expect(entity.data_fim).toBe('2027-04-01')
    expect(entity.ativo).toBe(true)
  })

  it('rejects empty name or name exceeding 100 chars', () => {
    expect(() => new Tarifario({ ...base_props, nome: '   ' })).toThrow(
      'O nome do tarifário é obrigatório.',
    )
    expect(
      () => new Tarifario({ ...base_props, nome: 'A'.repeat(101) }),
    ).toThrow('O nome do tarifário deve ter no máximo 100 caracteres.')
  })

  it('rejects invalid dates or data_inicio >= data_fim', () => {
    expect(is_valid_iso_date('2027-02-30')).toBe(false)
    expect(
      () => new Tarifario({ ...base_props, data_inicio: '2027-04-01' }),
    ).toThrow('A data de início deve ser anterior à data de término.')
    expect(
      () => new Tarifario({ ...base_props, data_inicio: '2027-04-05' }),
    ).toThrow('A data de início deve ser anterior à data de término.')
  })

  it('validates and converts monetary values without floating point drift', () => {
    expect(normalize_valor_diaria('0')).toBe('0.00')
    expect(normalize_valor_diaria('199.9')).toBe('199.90')
    expect(valor_diaria_to_cents('250.75')).toBe(25075)
    expect(cents_to_valor_diaria(25075)).toBe('250.75')
    expect(() => normalize_valor_diaria('-10.00')).toThrow()
    expect(() => normalize_valor_diaria('10.999')).toThrow()
  })
})
