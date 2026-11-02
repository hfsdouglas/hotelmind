import { describe, expect, it } from 'vitest'
import {
  count_effective_nights,
  find_conflicting_periods,
  tarifario_form_schema,
  to_exclusive_end_date,
  to_inclusive_end_date,
} from './tarifario.schema'

describe('tarifario.schema (web)', () => {
  it('converts between UI inclusive end date and API exclusive end date accurately', () => {
    expect(to_exclusive_end_date('2027-03-31')).toBe('2027-04-01')
    expect(to_inclusive_end_date('2027-04-01')).toBe('2027-03-31')
    expect(count_effective_nights('2027-03-01', '2027-03-31')).toBe(31)
    expect(count_effective_nights('2027-03-10', '2027-03-10')).toBe(1)
  })

  it('detects overlapping active periods while allowing consecutive periods and self-exclusion', () => {
    const existing = [
      {
        id: 't-1',
        categoria_quarto_id: 'cat-1',
        nome: 'Março',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
        valor_diaria: '200.00',
        ativo: true,
      },
      {
        id: 't-inactive',
        categoria_quarto_id: 'cat-1',
        nome: 'Inativo Abril',
        data_inicio: '2027-04-01',
        data_fim: '2027-05-01',
        valor_diaria: '180.00',
        ativo: false,
      },
    ]

    // Consecutive period (effective 01/04 to 30/04 -> [2027-04-01, 2027-05-01))
    expect(
      find_conflicting_periods('2027-04-01', '2027-04-30', existing),
    ).toEqual([])

    // Overlapping period (15/03 to 15/04)
    expect(
      find_conflicting_periods('2027-03-15', '2027-04-15', existing),
    ).toHaveLength(1)

    // Editing own period (exclude_id = 't-1') does not conflict with itself
    expect(
      find_conflicting_periods('2027-03-01', '2027-03-31', existing, 't-1'),
    ).toEqual([])
  })

  it('validates form fields including single-day effective range and rejects invalid inputs', () => {
    expect(
      tarifario_form_schema.safeParse({
        nome: '  Alta Temporada  ',
        categoria_quarto_id: 'cat-1',
        data_inicio: '2027-03-10',
        data_fim_efetiva: '2027-03-10',
        valor_diaria: '350.00',
        ativo: true,
      }).success,
    ).toBe(true)

    expect(
      tarifario_form_schema.safeParse({
        nome: 'Inválido',
        categoria_quarto_id: 'cat-1',
        data_inicio: '2027-03-15',
        data_fim_efetiva: '2027-03-10',
        valor_diaria: '350.00',
        ativo: true,
      }).success,
    ).toBe(false)
  })
})
