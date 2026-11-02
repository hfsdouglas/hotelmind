import type { CategoriaQuarto } from '@/core/entities/categoria_quarto'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface CreateCategoriaQuartoData {
  hotel_id: string
  nome: string
  status?: string
}

export interface UpdateCategoriaQuartoData {
  id: string
  hotel_id: string
  nome: string
  status: string
}

export interface CategoriaQuartoPaginationInput extends PaginationInput {
  status?: string
}

export interface ICategoriaQuartoRepository {
  list(hotel_id: string, input: CategoriaQuartoPaginationInput): Promise<PaginatedResult<CategoriaQuarto>>
  create(data: CreateCategoriaQuartoData): Promise<CategoriaQuarto>
  find_by_id(id: string, hotel_id: string): Promise<CategoriaQuarto | null>
  update(data: UpdateCategoriaQuartoData): Promise<CategoriaQuarto>
}
