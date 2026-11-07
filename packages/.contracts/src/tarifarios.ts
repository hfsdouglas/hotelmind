import type { PaginacaoMeta } from './grupos.js'
import type { ParceiroResumo } from './parceiros_comerciais.js'
import type { CategoriaQuartoResumo } from './quartos.js'

export interface RegimeAlimentacaoResumo {
  id: string
  titulo: string
  cor_pulseira: string
}

export interface Tarifario {
  id: string
  hotel_id: string
  parceiro_id: string | null
  categoria_quarto_id?: string // Retrocompatibilidade (primeira categoria)
  categoria_quarto_ids: string[]
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias: number
  ativo: boolean
  parceiro?: ParceiroResumo | null
  categoria_quarto?: CategoriaQuartoResumo // Retrocompatibilidade
  categorias: CategoriaQuartoResumo[]
  regime_alimentacao: RegimeAlimentacaoResumo
  criado_em: string
  atualizado_em: string
}

export interface TarifarioListResponse {
  data: Tarifario[]
  meta: PaginacaoMeta
}

export interface TarifarioListParams {
  pagina?: number
  limite?: number
  busca?: string
  parceiro_id?: string | null
  categoria_quarto_id?: string | string[]
  regime_alimentacao_id?: string
  ativo?: boolean
}

export interface CreateTarifarioPayload {
  categoria_quarto_id?: string // Retrocompatibilidade
  categoria_quarto_ids: string[]
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias?: number
  ativo?: boolean
}

export interface UpdateTarifarioPayload {
  categoria_quarto_id?: string // Retrocompatibilidade
  categoria_quarto_ids?: string[]
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  nome?: string
  datas?: string[]
  valor_diaria?: string
  minimo_diarias?: number
  ativo?: boolean
}

export interface PeriodoTarifarioCalendario {
  id: string
  categoria_quarto_id: string
  categoria_quarto_ids?: string[]
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias?: number
  ativo: boolean
}

export interface ConsultarCalendarioTarifariosParams {
  categoria_quarto_id: string
  parceiro_id?: string | null
  data_inicio?: string
  data_fim?: string
}

export interface ConsultarCalendarioTarifariosResponse {
  data: PeriodoTarifarioCalendario[]
}

export interface NoiteCalculadaReserva {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export interface CalculoTarifaReserva {
  noites: NoiteCalculadaReserva[]
  valor_total: string
}
