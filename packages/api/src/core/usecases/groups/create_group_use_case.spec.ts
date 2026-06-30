import { describe, it, expect, beforeEach } from 'vitest'
import { CreateGroupUseCase } from './create_group_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'

describe('CreateGroupUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: CreateGroupUseCase

  beforeEach(() => {
    repo = new InMemoryGroupRepository()
    sut = new CreateGroupUseCase(repo)
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
