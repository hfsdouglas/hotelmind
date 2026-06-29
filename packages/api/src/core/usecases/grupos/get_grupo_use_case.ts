import type { IGrupoRepository } from '@/core/repositories/grupo_repository'
import type { Grupo } from '@/core/entities/grupo'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

export class GetGrupoUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(id: string, hotelId: string): Promise<Grupo> {
    const grupo = await this.grupoRepository.findById(id, hotelId)
    if (!grupo) throw new GrupoNotFoundError()
    return grupo
  }
}
