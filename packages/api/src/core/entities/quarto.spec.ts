import { describe, expect, it } from 'vitest'
import { ConfiguracaoCama } from './configuracao_cama'
import { Quarto } from './quarto'

describe('Quarto', () => {
  it('rejects invalid capacity and empty beds', () => {
    expect(() => new Quarto({ id: '1', hotel_id: 'h1', categoria_id: 'c1', identificacao: '101', descricao: null, status: 'S', limite_hospedes: 0, camas: [], categoria: { id: 'c1', nome: 'Suíte', status: 'S' }, created_at: new Date(), updated_at: new Date() })).toThrow()
  })

  it('accepts a positive capacity and bed configuration', () => {
    const room = new Quarto({ id: '1', hotel_id: 'h1', categoria_id: 'c1', identificacao: '101', descricao: null, status: 'S', limite_hospedes: 2, camas: [new ConfiguracaoCama({ id: 'b1', tipo: 'casal', quantidade: 1 })], categoria: { id: 'c1', nome: 'Suíte', status: 'S' }, created_at: new Date(), updated_at: new Date() })
    expect(room.limite_hospedes).toBe(2)
  })
})
