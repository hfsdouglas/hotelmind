import { describe, it, expect, beforeEach } from 'vitest'
import { GetGroupUseCase } from './get_group_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

const HOTEL_ID = 'hotel-001'

describe('GetGroupUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: GetGroupUseCase

  beforeEach(() => {
    repo = new InMemoryGroupRepository()
    sut = new GetGroupUseCase(repo)
  })

  it('returns the group by id and hotelId', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'Recepcionista' })
    const result = await sut.execute(group.id, HOTEL_ID)
    expect(result.id).toBe(group.id)
    expect(result.grupo).toBe('Recepcionista')
  })

  it('throws GrupoNotFoundError when group does not exist', async () => {
    await expect(sut.execute('non-existent', HOTEL_ID)).rejects.toThrow(GrupoNotFoundError)
  })

  it('throws GrupoNotFoundError when hotelId does not match', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
    await expect(sut.execute(group.id, 'other-hotel')).rejects.toThrow(GrupoNotFoundError)
  })
})
