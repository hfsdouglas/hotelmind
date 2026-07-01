import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateGroupUseCase } from './update_group_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

const HOTEL_ID = 'hotel-001'

describe('UpdateGroupUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: UpdateGroupUseCase

  beforeEach(() => {
    repo = new InMemoryGroupRepository()
    sut = new UpdateGroupUseCase(repo)
  })

  it('updates the grupo name', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'Recepcionista' })
    const updated = await sut.execute(group.id, HOTEL_ID, { grupo: 'Gerente' })
    expect(updated.grupo).toBe('Gerente')
  })

  it('updates the status', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'G1', status: 'S' })
    const updated = await sut.execute(group.id, HOTEL_ID, { status: 'N' })
    expect(updated.status).toBe('N')
  })

  it('throws GrupoNotFoundError when group does not exist', async () => {
    await expect(sut.execute('missing', HOTEL_ID, { grupo: 'X' })).rejects.toThrow(GrupoNotFoundError)
  })

  it('throws GrupoNotFoundError when hotelId does not match', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
    await expect(sut.execute(group.id, 'other-hotel', { grupo: 'X' })).rejects.toThrow(GrupoNotFoundError)
  })
})
