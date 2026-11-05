import { describe, expect, it } from 'vitest'
import {
  create_quarto_body_schema,
  list_quartos_query_schema,
  update_quarto_body_schema,
} from './quartos_schema'

describe('create_quarto_body_schema', () => {
  it('accepts a complete room', () => {
    expect(
      create_quarto_body_schema.safeParse({
        categoria_id: 'c1',
        identificacao: '101',
        limite_hospedes: 2,
        camas: [{ tipo: 'casal', quantidade: 1 }],
      }).success
    ).toBe(true)
  })

  it('rejects duplicate bed types and invalid capacity', () => {
    expect(
      create_quarto_body_schema.safeParse({
        categoria_id: 'c1',
        identificacao: '101',
        limite_hospedes: 0,
        camas: [
          { tipo: 'casal', quantidade: 1 },
          { tipo: 'casal', quantidade: 1 },
        ],
      }).success
    ).toBe(false)
  })

  it('rejects non-numeric identifications and accepts leading zeroes with description', () => {
    expect(
      create_quarto_body_schema.safeParse({
        categoria_id: 'c1',
        identificacao: '10A',
        descricao: 'Vista',
        limite_hospedes: 2,
        camas: [{ tipo: 'casal', quantidade: 1 }],
      }).success
    ).toBe(false)
    const result = update_quarto_body_schema.safeParse({
      categoria_id: 'c1',
      identificacao: '0101',
      descricao: 'Vista',
      status: 'N',
      limite_hospedes: 2,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })
    expect(result.success).toBe(true)
  })

  it('applies pagination defaults and accepts search/status filters', () => {
    const result = list_quartos_query_schema.parse({
      busca: 'queen',
      status: 'N',
      limite: '100',
      pagina: '2',
    })
    expect(result).toMatchObject({
      busca: 'queen',
      status: 'N',
      limite: 100,
      pagina: 2,
    })
  })

  it('rejects a limit outside the supported range', () => {
    expect(list_quartos_query_schema.safeParse({ limite: 251 }).success).toBe(
      false
    )
  })
})
