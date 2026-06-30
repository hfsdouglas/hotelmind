import type { IGroupRepository, CreateGroupData } from '@/core/repositories/groups/group.repository'
import type { Grupo } from '@/core/entities/grupo'
import { GrupoConflictError } from '@/core/errors/grupo_conflict_error'

export class CreateGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(data: CreateGroupData): Promise<Grupo> {
    try {
      return await this.groupRepository.create(data)
    } catch (err: unknown) {
      if (isUniqueConstraintError(err)) {
        throw new GrupoConflictError()
      }
      throw err
    }
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}
