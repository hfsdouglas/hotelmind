import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteGrupoUseCase } from './delete_grupo_use_case'
import { InMemoryGrupoRepository } from '@/db/repositories/grupos/in-memory/in_memory_grupo_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'

describe('DeleteGrupoUseCase', () => {
  let repo: InMemoryGrupoRepository
  let sut: DeleteGrupoUseCase

  beforeEach(() => {
    repo = new InMemoryGrupoRepository()
    sut = new DeleteGrupoUseCase(repo)
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
