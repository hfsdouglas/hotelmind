import { describe, expect, it } from 'vitest'
import { create_categoria_quarto_body_schema, update_categoria_quarto_body_schema } from './categorias_quartos_schema'

describe('create_categoria_quarto_body_schema', () => {
  it('trims and accepts a valid category', () => {
    const result = create_categoria_quarto_body_schema.parse({ nome: ' Suíte ' })
    expect(result.nome).toBe('Suíte')
    expect(result.status).toBe('S')
  })

  it('rejects an empty category name', () => {
    expect(create_categoria_quarto_body_schema.safeParse({ nome: ' ' }).success).toBe(false)
  })

  it('accepts an explicit active or inactive status on update', () => {
    expect(update_categoria_quarto_body_schema.safeParse({ nome: 'Suíte', status: 'N' }).success).toBe(true)
  })
})
