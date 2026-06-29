import type { IGrupoRepository } from '@/core/repositories/grupo_repository'
import type { Rota } from '@/core/entities/rota'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'

export class SyncGrupoRoutesUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(grupoId: string, hotelId: string, rotaIds: string[]): Promise<Rota[]> {
    const grupo = await this.grupoRepository.findById(grupoId, hotelId)
    if (!grupo) throw new GrupoNotFoundError()

    await this.grupoRepository.syncRoutes(grupoId, rotaIds)
    return this.grupoRepository.listRoutes(grupoId)
  }
}
