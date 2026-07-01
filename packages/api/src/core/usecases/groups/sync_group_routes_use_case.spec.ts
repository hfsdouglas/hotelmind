import { describe, it, expect, beforeEach } from 'vitest'
import { SyncGroupRoutesUseCase } from './sync_group_routes_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

const HOTEL_ID = 'hotel-001'

describe('SyncGroupRoutesUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: SyncGroupRoutesUseCase

  beforeEach(() => {
    repo = new InMemoryGroupRepository()
    sut = new SyncGroupRoutesUseCase(repo)
  })

  it('syncs routes and returns the updated route list', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
    const routes = await sut.execute(group.id, HOTEL_ID, ['r-1', 'r-2'])
    expect(routes).toHaveLength(2)
    expect(routes.map(r => r.id)).toEqual(['r-1', 'r-2'])
  })

  it('replaces previously synced routes', async () => {
    const group = await repo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
    await sut.execute(group.id, HOTEL_ID, ['r-1', 'r-2'])
    const routes = await sut.execute(group.id, HOTEL_ID, ['r-3'])
    expect(routes).toHaveLength(1)
    expect(routes[0].id).toBe('r-3')
  })

  it('throws GrupoNotFoundError when group does not exist', async () => {
    await expect(sut.execute('missing', HOTEL_ID, ['r-1'])).rejects.toThrow(GrupoNotFoundError)
  })
})
