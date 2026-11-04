import type { Lead } from '@/core/entities/lead'
import type { ILeadRepository } from '@/core/repositories/leads/lead_repository'
import type {
  PaginatedResult,
  PaginationInput,
} from '@/core/repositories/pagination'

export interface ListarLeadsInput extends PaginationInput {
  hotel_id: string
}

export class ListarLeadsUseCase {
  constructor(private readonly repository: ILeadRepository) {}

  async execute(input: ListarLeadsInput): Promise<PaginatedResult<Lead>> {
    return this.repository.list(input.hotel_id, {
      pagina: input.pagina,
      limite: input.limite,
      busca: input.busca,
    })
  }
}
