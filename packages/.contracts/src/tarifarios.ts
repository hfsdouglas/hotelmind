import type { PaginacaoMeta } from './grupos.js'
import type { CategoriaQuartoResumo } from './quartos.js'

export interface RegimeAlimentacaoResumo {
  id: string
  titulo: string
  cor_pulseira: string
}

export interface Tarifario {
  id: string
  hotel_id: string
  categoria_quarto_id: string
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
  categoria_quarto: CategoriaQuartoResumo
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
  categoria_quarto_id?: string
  regime_alimentacao_id?: string
  ativo?: boolean
}

export interface CreateTarifarioPayload {
  categoria_quarto_id: string
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo?: boolean
}

export interface UpdateTarifarioPayload {
  categoria_quarto_id?: string
  regime_alimentacao_id?: string
  nome?: string
  datas?: string[]
  valor_diaria?: string
  ativo?: boolean
}

export interface PeriodoTarifarioCalendario {
  id: string
  categoria_quarto_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
}

export interface ConsultarCalendarioTarifariosParams {
  categoria_quarto_id: string
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
