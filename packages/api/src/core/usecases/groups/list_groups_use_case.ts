import type { Grupo } from '@/core/entities/grupo'
import type {
  GroupPaginationInput,
  IGroupRepository,
} from '@/core/repositories/groups/group.repository'
import type { PaginatedResult } from '@/core/repositories/pagination'

export class ListGroupsUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(
    hotelId: string,
    pagination: GroupPaginationInput
  ): Promise<PaginatedResult<Grupo>> {
    return this.groupRepository.list(hotelId, pagination)
  }
}
