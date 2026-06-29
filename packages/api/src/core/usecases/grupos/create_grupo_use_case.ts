import type { IGrupoRepository, CreateGrupoData } from '@/core/repositories/grupo_repository'
import type { Grupo } from '@/core/entities/grupo'
import { GrupoConflictError } from '@/core/errors/grupo_conflict_error'

export class CreateGrupoUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(data: CreateGrupoData): Promise<Grupo> {
    try {
      return await this.grupoRepository.create(data)
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
