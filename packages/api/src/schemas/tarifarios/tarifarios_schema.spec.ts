import { describe, expect, it } from 'vitest'
import {
  calendario_tarifarios_query_schema,
  create_tarifario_body_schema,
  list_tarifarios_query_schema,
  update_tarifario_body_schema,
} from './tarifarios_schema'

const VALID_REGIME_ID = '33333333-3333-4333-8333-333333333333'

describe('tarifarios_schema', () => {
  it('validates create_tarifario_body_schema with trimmed name, deduplicated sorted dates and decimal normalization', () => {
    const parsed = create_tarifario_body_schema.parse({
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: VALID_REGIME_ID,
      nome: '  Baixa temporada  ',
      datas: ['2027-03-05', '2027-03-01', '2027-03-05'],
      valor_diaria: '200.5',
    })
    expect(parsed).toEqual({
      categoria_quarto_id: 'cat-1',
      categoria_quarto_ids: ['cat-1'],
      regime_alimentacao_id: VALID_REGIME_ID,
      nome: 'Baixa temporada',
      datas: ['2027-03-01', '2027-03-05'],
      valor_diaria: '200.50',
      minimo_diarias: 1,
      ativo: true,
    })
  })

  it('validates create_tarifario_body_schema with multi-category and minimo_diarias', () => {
    const parsed = create_tarifario_body_schema.parse({
      categoria_quarto_ids: ['cat-1', 'cat-2', 'cat-1'],
      regime_alimentacao_id: VALID_REGIME_ID,
      nome: 'Fim de semana luxo',
      datas: ['2027-03-01'],
      valor_diaria: '300.00',
      minimo_diarias: 2,
    })
    expect(parsed.categoria_quarto_ids).toEqual(['cat-1', 'cat-2'])
    expect(parsed.categoria_quarto_id).toBe('cat-1')
    expect(parsed.minimo_diarias).toBe(2)
  })

  it('validates create_tarifario_body_schema with parceiro_id', () => {
    const parceiroUuid = '44444444-4444-4444-8444-444444444444'
    const parsed = create_tarifario_body_schema.parse({
      categoria_quarto_id: 'cat-1',
      regime_alimentacao_id: VALID_REGIME_ID,
      parceiro_id: parceiroUuid,
      nome: 'Tarifa Petrobras',
      datas: ['2027-03-01'],
      valor_diaria: '200.00',
    })
    expect(parsed.parceiro_id).toBe(parceiroUuid)
  })

  it('rejects empty name, empty datas array, negative or 3-decimal rate values, and missing regime_alimentacao_id', () => {
    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        nome: 'Tarifa',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: '   ',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: 'Tarifa',
        datas: [],
        valor_diaria: '200.00',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: 'Tarifa',
        datas: ['2027-03-01'],
        valor_diaria: '-5.00',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: 'Tarifa',
        datas: ['2027-03-01'],
        valor_diaria: '200.999',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_ids: [],
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: 'Tarifa',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      }).success
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_ids: ['cat-1'],
        regime_alimentacao_id: VALID_REGIME_ID,
        nome: 'Tarifa',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
        minimo_diarias: 0,
      }).success
    ).toBe(false)
  })

  it('validates list_tarifarios_query_schema and calendario_tarifarios_query_schema', () => {
    const list_query = list_tarifarios_query_schema.parse({
      ativo: 'false',
      categoria_quarto_id: 'cat-1,cat-2',
    })
    expect(list_query.pagina).toBe(1)
    expect(list_query.limite).toBe(25)
    expect(list_query.ativo).toBe(false)
    expect(list_query.categoria_quarto_id).toEqual(['cat-1', 'cat-2'])

    expect(list_tarifarios_query_schema.safeParse({ limite: 10 }).success).toBe(
      false
    )

    expect(
      calendario_tarifarios_query_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
      }).success
    ).toBe(true)

    expect(
      update_tarifario_body_schema.safeParse({
        datas: [],
      }).success
    ).toBe(false)

    const updated = update_tarifario_body_schema.parse({
      categoria_quarto_ids: ['cat-2', 'cat-3'],
      minimo_diarias: 3,
    })
    expect(updated.categoria_quarto_ids).toEqual(['cat-2', 'cat-3'])
    expect(updated.minimo_diarias).toBe(3)
  })
})
