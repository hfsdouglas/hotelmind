import type { IGrupoRepository } from '@/core/repositories/grupo_repository'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'

export class DeleteGrupoUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(id: string, hotelId: string): Promise<void> {
    const existing = await this.grupoRepository.findById(id, hotelId)
    if (!existing) throw new GrupoNotFoundError()

    const hasUsers = await this.grupoRepository.hasLinkedUsers(id, hotelId)
    if (hasUsers) throw new GrupoLinkedUsersError()

    await this.grupoRepository.delete(id, hotelId)
  }
}
