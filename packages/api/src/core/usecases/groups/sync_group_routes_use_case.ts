import type { IGroupRepository } from '@/core/repositories/groups/group.repository'
import type { Rota } from '@/core/entities/rota'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

export class SyncGroupRoutesUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: string, hotelId: string, routeIds: string[]): Promise<Rota[]> {
    const group = await this.groupRepository.findById(groupId, hotelId)
    if (!group) throw new GrupoNotFoundError()

    await this.groupRepository.syncRoutes(groupId, routeIds)
    return this.groupRepository.listRoutes(groupId)
  }
}
