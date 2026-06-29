import type { IGrupoRepository, UpdateGrupoData } from '@/core/repositories/grupo_repository'
import type { Grupo } from '@/core/entities/grupo'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoConflictError } from '@/core/errors/grupo_conflict_error'

export class UpdateGrupoUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(id: string, hotelId: string, data: UpdateGrupoData): Promise<Grupo> {
    const existing = await this.grupoRepository.findById(id, hotelId)
    if (!existing) throw new GrupoNotFoundError()

    try {
      return await this.grupoRepository.update(id, hotelId, data)
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
