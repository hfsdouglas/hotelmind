import type { IGrupoRepository, PaginationInput, PaginatedResult } from '@/core/repositories/grupo_repository'
import type { Grupo } from '@/core/entities/grupo'

export class ListGruposUseCase {
  constructor(private readonly grupoRepository: IGrupoRepository) {}

  async execute(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<Grupo>> {
    return this.grupoRepository.list(hotelId, pagination)
  }
}
