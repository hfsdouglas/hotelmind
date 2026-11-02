import { describe, expect, it } from 'vitest'
import {
  calendario_tarifarios_query_schema,
  create_tarifario_body_schema,
  list_tarifarios_query_schema,
  update_tarifario_body_schema,
} from './tarifarios_schema'

describe('tarifarios_schema', () => {
  it('validates create_tarifario_body_schema with trimmed name, valid dates and decimal normalization', () => {
    const parsed = create_tarifario_body_schema.parse({
      categoria_quarto_id: 'cat-1',
      nome: '  Baixa temporada  ',
      data_inicio: '2027-03-01',
      data_fim: '2027-04-01',
      valor_diaria: '200.5',
    })
    expect(parsed).toEqual({
      categoria_quarto_id: 'cat-1',
      nome: 'Baixa temporada',
      data_inicio: '2027-03-01',
      data_fim: '2027-04-01',
      valor_diaria: '200.50',
      ativo: true,
    })
  })

  it('rejects empty name, invalid date range, and negative or 3-decimal rate values', () => {
    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        nome: '   ',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
        valor_diaria: '200.00',
      }).success,
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        nome: 'Tarifa',
        data_inicio: '2027-04-01',
        data_fim: '2027-04-01',
        valor_diaria: '200.00',
      }).success,
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        nome: 'Tarifa',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
        valor_diaria: '-5.00',
      }).success,
    ).toBe(false)

    expect(
      create_tarifario_body_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        nome: 'Tarifa',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
        valor_diaria: '200.999',
      }).success,
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

    expect(
      list_tarifarios_query_schema.safeParse({ limite: 10 }).success,
    ).toBe(false)

    expect(
      calendario_tarifarios_query_schema.safeParse({
        categoria_quarto_id: 'cat-1',
        data_inicio: '2027-03-01',
        data_fim: '2027-04-01',
      }).success,
    ).toBe(true)

    expect(
      update_tarifario_body_schema.safeParse({
        data_inicio: '2027-05-01',
        data_fim: '2027-04-01',
      }).success,
    ).toBe(false)
  })
})
