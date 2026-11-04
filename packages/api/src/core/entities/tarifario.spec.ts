import { describe, expect, it } from 'vitest'
import {
  Tarifario,
  cents_to_valor_diaria,
  normalize_valor_diaria,
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
  })

  it('rejects empty name or name exceeding 100 chars', () => {
    expect(() => new Tarifario({ ...base_props, nome: '   ' })).toThrow(
      /obrigatório/,
    )
    expect(
      () => new Tarifario({ ...base_props, nome: 'A'.repeat(101) }),
    ).toThrow(/100 caracteres/)
  })

  it('rejects missing regime_alimentacao_id', () => {
    expect(
      () => new Tarifario({ ...base_props, regime_alimentacao_id: '' }),
    ).toThrow(/regime de alimentação é obrigatório/)
  })

  it('rejects empty datas array or invalid ISO date', () => {
    expect(() => new Tarifario({ ...base_props, datas: [] })).toThrow(
      /Selecione ao menos uma data/,
    )
    expect(
      () => new Tarifario({ ...base_props, datas: ['2026-02-30'] }),
    ).toThrow(/inválida/)
  })

  it('rejects negative or >2 decimal places valor_diaria', () => {
    expect(() => normalize_valor_diaria('-10.00')).toThrow()
    expect(() => normalize_valor_diaria('10.999')).toThrow()
    expect(valor_diaria_to_cents('199.90')).toBe(19990)
    expect(cents_to_valor_diaria(19990)).toBe('199.90')
  })
})
