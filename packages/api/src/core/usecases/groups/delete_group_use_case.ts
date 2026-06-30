import type { IGroupRepository } from '@/core/repositories/groups/group.repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'

export class DeleteGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(id: string, hotelId: string): Promise<void> {
    const existing = await this.groupRepository.findById(id, hotelId)
    if (!existing) throw new GrupoNotFoundError()

    const hasUsers = await this.groupRepository.hasLinkedUsers(id, hotelId)
    if (hasUsers) throw new GrupoLinkedUsersError()

    await this.groupRepository.delete(id, hotelId)
  }
}
