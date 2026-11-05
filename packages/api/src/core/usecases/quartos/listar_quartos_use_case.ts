import type { Quarto } from '@/core/entities/quarto'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  IQuartoRepository,
  QuartoPaginationInput,
} from '@/core/repositories/quartos/quarto.repository'

export class ListarQuartosUseCase {
  constructor(private readonly repository: IQuartoRepository) {}

  execute(
    hotel_id: string,
    input: QuartoPaginationInput
  ): Promise<PaginatedResult<Quarto>> {
    return this.repository.list(hotel_id, input)
  }
}
