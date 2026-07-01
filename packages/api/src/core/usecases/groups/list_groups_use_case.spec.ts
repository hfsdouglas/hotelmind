import { describe, it, expect, beforeEach } from 'vitest'
import { ListGroupsUseCase } from './list_groups_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'

describe('ListGroupsUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: ListGroupsUseCase

  beforeEach(async () => {
    repo = new InMemoryGroupRepository()
    sut = new ListGroupsUseCase(repo)

    await repo.create({ hotel_id: HOTEL_A, grupo: 'Recepcionista' })
    await repo.create({ hotel_id: HOTEL_A, grupo: 'Gerente' })
    await repo.create({ hotel_id: HOTEL_B, grupo: 'Limpeza' })
  })

  it('returns only groups for the given hotelId', async () => {
    const result = await sut.execute(HOTEL_A, { pagina: 1, limite: 50 })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(g => g.hotel_id === HOTEL_A)).toBe(true)
  })

  it('respects pagination limits', async () => {
    const result = await sut.execute(HOTEL_A, { pagina: 1, limite: 1 })
    expect(result.data).toHaveLength(1)
    expect(result.meta.total).toBe(2)
    expect(result.meta.ultima_pagina).toBe(2)
  })

  it('filters by busca', async () => {
    const result = await sut.execute(HOTEL_A, { pagina: 1, limite: 50, busca: 'recep' })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].grupo).toBe('Recepcionista')
  })

  it('returns empty list for unknown hotel', async () => {
    const result = await sut.execute('hotel-unknown', { pagina: 1, limite: 50 })
    expect(result.data).toHaveLength(0)
    expect(result.meta.total).toBe(0)
  })
})
