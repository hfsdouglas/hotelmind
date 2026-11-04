import type { RegimeAlimentacao } from '@/core/entities/regime_alimentacao'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface RegimeAlimentacaoListFilter {
  pagina: number
  limite: number
  busca?: string
  ativo?: boolean
}

export interface CreateRegimeAlimentacaoData {
  hotel_id: string
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo: boolean
}

export interface UpdateRegimeAlimentacaoData {
  id: string
  hotel_id: string
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo: boolean
}

export interface IRegimeAlimentacaoRepository {
  list(
    hotel_id: string,
    filter: RegimeAlimentacaoListFilter
  ): Promise<PaginatedResult<RegimeAlimentacao>>
  create(data: CreateRegimeAlimentacaoData): Promise<RegimeAlimentacao>
  find_by_id(id: string, hotel_id: string): Promise<RegimeAlimentacao | null>
  find_by_titulo(
    titulo: string,
    hotel_id: string,
    exclude_id?: string
  ): Promise<RegimeAlimentacao | null>
  update(data: UpdateRegimeAlimentacaoData): Promise<RegimeAlimentacao>
}
