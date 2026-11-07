import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import type { Tarifario } from '@/core/entities/tarifario'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface TarifarioListFilter {
  pagina: number
  limite: number
  busca?: string
  parceiro_id?: string | null
  categoria_quarto_id?: string | string[]
  regime_alimentacao_id?: string
  ativo?: boolean
}

export interface CreateTarifarioData {
  hotel_id: string
  categoria_quarto_id?: string
  categoria_quarto_ids: string[]
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias?: number
  ativo: boolean
}

export interface UpdateTarifarioData {
  id: string
  hotel_id: string
  categoria_quarto_id?: string
  categoria_quarto_ids?: string[]
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias?: number
  ativo: boolean
}

export interface FindCalendarioPeriodsInput {
  hotel_id: string
  categoria_quarto_id: string
  parceiro_id?: string | null
  data_inicio?: string
  data_fim?: string
}

export interface FindOverlappingActiveInput {
  hotel_id: string
  categoria_quarto_id?: string
  categoria_quarto_ids?: string[]
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  datas: string[]
  exclude_id?: string
}

export interface ITarifarioRepository {
  list(
    hotel_id: string,
    input: TarifarioListFilter
  ): Promise<PaginatedResult<Tarifario>>
  find_by_id(id: string, hotel_id: string): Promise<Tarifario | null>
  find_periods_by_category(
    input: FindCalendarioPeriodsInput
  ): Promise<PeriodoTarifarioCalendario[]>
  find_overlapping_active(
    input: FindOverlappingActiveInput
  ): Promise<Tarifario | null>
  find_active_for_range(input: {
    hotel_id: string
    categoria_quarto_id: string
    data_inicio: string
    data_fim: string
    parceiro_id?: string | null
  }): Promise<Tarifario[]>
  create(data: CreateTarifarioData): Promise<Tarifario>
  update(data: UpdateTarifarioData): Promise<Tarifario>
}
