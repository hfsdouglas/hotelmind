import type { CategoriaQuarto } from '@/core/entities/categoria_quarto'
import type {
  CategoriaQuartoPaginationInput,
  ICategoriaQuartoRepository,
} from '@/core/repositories/categorias_quartos/categoria_quarto.repository'
import type { PaginatedResult } from '@/core/repositories/pagination'

export class ListarCategoriasQuartoUseCase {
  constructor(private readonly repository: ICategoriaQuartoRepository) {}

  execute(
    hotel_id: string,
    input: CategoriaQuartoPaginationInput
  ): Promise<PaginatedResult<CategoriaQuarto>> {
    return this.repository.list(hotel_id, input)
  }
}
