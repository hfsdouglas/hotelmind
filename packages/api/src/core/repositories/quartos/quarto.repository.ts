import type { Quarto } from '@/core/entities/quarto'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'
import type { TipoCama } from '@hotelmind/contracts'

export interface CreateQuartoData {
  hotel_id: string
  categoria_id: string
  identificacao: string
  descricao?: string
  limite_hospedes: number
  camas: Array<{ tipo: TipoCama; quantidade: number }>
}

export interface UpdateQuartoData extends CreateQuartoData {
  id: string
  status: string
}

export interface QuartoPaginationInput extends PaginationInput {
  categoria_id?: string[]
  status?: string
}

export interface IQuartoRepository {
  list(hotel_id: string, input: QuartoPaginationInput): Promise<PaginatedResult<Quarto>>
  create(data: CreateQuartoData): Promise<Quarto>
  find_by_id(id: string, hotel_id: string): Promise<Quarto | null>
  update(data: UpdateQuartoData): Promise<Quarto>
}
