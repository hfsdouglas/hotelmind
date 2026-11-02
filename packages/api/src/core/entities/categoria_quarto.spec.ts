import { describe, expect, it } from 'vitest'
import { CategoriaQuarto } from './categoria_quarto'

describe('CategoriaQuarto', () => {
  it('exposes active state', () => {
    const category = new CategoriaQuarto({ id: '1', hotel_id: 'h1', nome: 'Suíte', status: 'S', created_at: new Date(), updated_at: new Date() })
    expect(category.is_ativa).toBe(true)
  })
})
