import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteGroupUseCase } from './delete_group_use_case'
import { InMemoryGroupRepository } from '@/core/repositories/groups/in-memory/in_memory_group_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'

describe('DeleteGroupUseCase', () => {
  let repo: InMemoryGroupRepository
  let sut: DeleteGroupUseCase

  beforeEach(() => {
    repo = new InMemoryGroupRepository()
    sut = new DeleteGroupUseCase(repo)
  })

  it('deletes a grupo when no linked users', async () => {
    const g = await repo.create({ hotel_id: 'h1', grupo: 'G1' })
    await sut.execute(g.id, 'h1')
    expect(await repo.findById(g.id, 'h1')).toBeNull()
  })

  it('throws GrupoNotFoundError when grupo does not exist', async () => {
    await expect(sut.execute('missing', 'h1')).rejects.toThrow(GrupoNotFoundError)
  })

  it('throws GrupoLinkedUsersError when grupo has linked users', async () => {
    const g = await repo.create({ hotel_id: 'h1', grupo: 'G1' })
    repo.setLinkedUsers(g.id, true)
    await expect(sut.execute(g.id, 'h1')).rejects.toThrow(GrupoLinkedUsersError)
  })
})
