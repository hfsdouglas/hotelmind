import type { IGroupRepository } from '@/core/repositories/groups/group.repository'
import type { Grupo } from '@/core/entities/grupo'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

export class GetGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(id: string, hotelId: string): Promise<Grupo> {
    const group = await this.groupRepository.findById(id, hotelId)
    if (!group) throw new GrupoNotFoundError()
    return group
  }
}
