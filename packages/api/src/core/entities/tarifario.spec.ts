import { describe, expect, it } from 'vitest'
import {
  cents_to_valor_diaria,
  normalize_valor_diaria,
  Tarifario,
  valor_diaria_to_cents,
} from './tarifario'

describe('Tarifario Entity', () => {
  const base_props = {
    id: 'tar-1',
    hotel_id: 'hotel-1',
    categoria_quarto_id: 'cat-1',
    regime_alimentacao_id: 'reg-1',
    nome: 'Alta Temporada',
    datas: ['2026-12-20', '2026-12-25', '2026-12-22'],
    valor_diaria: '350.5',
    ativo: true,
    categoria_quarto: { id: 'cat-1', nome: 'Standard', status: 'S' as const },
    regime_alimentacao: {
      id: 'reg-1',
      titulo: 'Café da Manhã',
      cor_pulseira: '#2563EB',
    },
    criado_em: '2026-11-02T12:00:00.000Z',
    atualizado_em: '2026-11-02T12:00:00.000Z',
  }

  it('creates a valid Tarifario with deduplicated and sorted dates and 2-decimal normalized valor_diaria', () => {
    const entity = new Tarifario(base_props)
    expect(entity.nome).toBe('Alta Temporada')
    expect(entity.valor_diaria).toBe('350.50')
    expect(entity.datas).toEqual(['2026-12-20', '2026-12-22', '2026-12-25'])
    expect(entity.parceiro_id).toBeNull()
    expect(entity.minimo_diarias).toBe(1)
    expect(entity.categoria_quarto_ids).toEqual(['cat-1'])
  })

  it('supports multiple categories and minimum stay', () => {
    const entity = new Tarifario({
      ...base_props,
      categoria_quarto_ids: ['cat-1', 'cat-2'],
      categorias: [
        { id: 'cat-1', nome: 'Standard', status: 'S' },
        { id: 'cat-2', nome: 'Luxo', status: 'S' },
      ],
      minimo_diarias: 3,
    })
    expect(entity.categoria_quarto_ids).toEqual(['cat-1', 'cat-2'])
    expect(entity.categorias).toHaveLength(2)
    expect(entity.minimo_diarias).toBe(3)
  })

  it('rejects invalid minimo_diarias (< 1 or non-integer)', () => {
    expect(() => new Tarifario({ ...base_props, minimo_diarias: 0 })).toThrow(
      /mínima de diárias/
    )
    expect(() => new Tarifario({ ...base_props, minimo_diarias: -2 })).toThrow(
      /mínima de diárias/
    )
    expect(() => new Tarifario({ ...base_props, minimo_diarias: 1.5 })).toThrow(
      /mínima de diárias/
    )
  })

  it('rejects when no categories are provided', () => {
    expect(
      () =>
        new Tarifario({
          ...base_props,
          categoria_quarto_id: undefined,
          categoria_quarto_ids: [],
        })
    ).toThrow(/Selecione ao menos uma categoria/)
  })

  it('supports partner association when parceiro_id and parceiro are provided', () => {
    const entity = new Tarifario({
      ...base_props,
      parceiro_id: 'parceiro-1',
      parceiro: { id: 'parceiro-1', razao_social: 'CVC Brasil S/A' },
    })
    expect(entity.parceiro_id).toBe('parceiro-1')
    expect(entity.parceiro?.razao_social).toBe('CVC Brasil S/A')
  })

  it('rejects empty name or name exceeding 100 chars', () => {
    expect(() => new Tarifario({ ...base_props, nome: '   ' })).toThrow(
      /obrigatório/
    )
    expect(
      () => new Tarifario({ ...base_props, nome: 'A'.repeat(101) })
    ).toThrow(/100 caracteres/)
  })

  it('rejects missing regime_alimentacao_id', () => {
    expect(
      () => new Tarifario({ ...base_props, regime_alimentacao_id: '' })
    ).toThrow(/regime de alimentação é obrigatório/)
  })

  it('rejects empty datas array or invalid ISO date', () => {
    expect(() => new Tarifario({ ...base_props, datas: [] })).toThrow(
      /Selecione ao menos uma data/
    )
    expect(
      () => new Tarifario({ ...base_props, datas: ['2026-02-30'] })
    ).toThrow(/inválida/)
  })

  it('rejects negative or >2 decimal places valor_diaria', () => {
    expect(() => normalize_valor_diaria('-10.00')).toThrow()
    expect(() => normalize_valor_diaria('10.999')).toThrow()
    expect(valor_diaria_to_cents('199.90')).toBe(19990)
    expect(cents_to_valor_diaria(19990)).toBe('199.90')
  })
})
