import { describe, expect, it } from 'vitest'
import {
  find_conflicting_periods,
  tarifario_form_schema,
} from './tarifario_schema'

describe('tarifario_schema (web)', () => {
  it('validates form with categoria_quarto_ids and minimo_diarias', () => {
    const valid = tarifario_form_schema.parse({
      nome: 'Tarifário Verão',
      categoria_quarto_ids: ['cat-1', 'cat-2'],
      regime_alimentacao_id: 'reg-1',
      datas: ['2027-01-15'],
      valor_diaria: '250,50',
      minimo_diarias: 2,
      ativo: true,
    })

    expect(valid.categoria_quarto_ids).toEqual(['cat-1', 'cat-2'])
    expect(valid.minimo_diarias).toBe(2)
    expect(valid.valor_diaria).toBe('250.50')
  })

  it('rejects empty categoria_quarto_ids when categoria_quarto_id is not set', () => {
    const result = tarifario_form_schema.safeParse({
      nome: 'Tarifário Sem Categoria',
      categoria_quarto_ids: [],
      regime_alimentacao_id: 'reg-1',
      datas: ['2027-01-15'],
      valor_diaria: '250,50',
      ativo: true,
    })

    expect(result.success).toBe(false)
  })

  it('detects conflicting periods matching any of the selected category IDs', () => {
    const periods = [
      {
        id: 'p1',
        categoria_quarto_id: 'cat-1',
        categoria_quarto_ids: ['cat-1'],
        nome: 'Tarifa A',
        datas: ['2027-01-15', '2027-01-16'],
        valor_diaria: '200.00',
        ativo: true,
      },
      {
        id: 'p2',
        categoria_quarto_id: 'cat-3',
        categoria_quarto_ids: ['cat-3'],
        nome: 'Tarifa B',
        datas: ['2027-01-15'],
        valor_diaria: '220.00',
        ativo: true,
      },
    ]

    const conflicts = find_conflicting_periods(
      ['2027-01-15'],
      periods,
      undefined,
      null,
      ['cat-1', 'cat-2']
    )

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].id).toBe('p1')
  })
})
