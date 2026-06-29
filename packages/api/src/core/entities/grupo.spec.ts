import { describe, it, expect } from 'vitest'
import { Grupo } from './grupo'

const base = {
  id: '1',
  hotel_id: 'h1',
  grupo: 'Recepcionista',
  descricao: 'Acesso à recepção',
  status: 'S',
  created_at: new Date(),
  updated_at: new Date(),
}

describe('Grupo', () => {
  it('creates a grupo', () => {
    const g = Grupo.create(base)
    expect(g.grupo).toBe('Recepcionista')
    expect(g.descricao).toBe('Acesso à recepção')
  })

  it('is_ativo returns true when status is S', () => {
    expect(Grupo.create({ ...base, status: 'S' }).is_ativo).toBe(true)
  })

  it('is_ativo returns false when status is N', () => {
    expect(Grupo.create({ ...base, status: 'N' }).is_ativo).toBe(false)
  })

  it('descricao can be null', () => {
    const g = Grupo.create({ ...base, descricao: null })
    expect(g.descricao).toBeNull()
  })
})
