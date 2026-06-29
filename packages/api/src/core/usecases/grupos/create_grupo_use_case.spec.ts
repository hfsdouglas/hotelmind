import { describe, it, expect, beforeEach } from 'vitest'
import { CreateGrupoUseCase } from './create_grupo_use_case'
import { InMemoryGrupoRepository } from '@/db/repositories/grupos/in-memory/in_memory_grupo_repository'

describe('CreateGrupoUseCase', () => {
  let repo: InMemoryGrupoRepository
  let sut: CreateGrupoUseCase

  beforeEach(() => {
    repo = new InMemoryGrupoRepository()
    sut = new CreateGrupoUseCase(repo)
  })

  it('creates a grupo', async () => {
    const g = await sut.execute({ hotel_id: 'h1', grupo: 'Recepcionista' })
    expect(g.grupo).toBe('Recepcionista')
    expect(g.hotel_id).toBe('h1')
    expect(g.status).toBe('S')
  })

  it('creates a grupo with descricao and custom status', async () => {
    const g = await sut.execute({ hotel_id: 'h1', grupo: 'G2', descricao: 'desc', status: 'N' })
    expect(g.descricao).toBe('desc')
    expect(g.status).toBe('N')
  })
})
