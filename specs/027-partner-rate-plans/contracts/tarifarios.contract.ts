import type { PaginacaoMeta } from './grupos.js'
import type { CategoriaQuartoResumo } from './quartos.js'

export interface RegimeAlimentacaoResumo {
  id: string
  titulo: string
  cor_pulseira: string
}

export interface ParceiroResumo {
  id: string
  razao_social: string
  nome_fantasia?: string | null
  tipo_parceiro?: string
}

export interface Tarifario {
  id: string
  hotel_id: string
  parceiro_id: string | null
  categoria_quarto_id: string
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
  parceiro?: ParceiroResumo | null
  categoria_quarto: CategoriaQuartoResumo
  regime_alimentacao: RegimeAlimentacaoResumo
  criado_em: string
  atualizado_em: string
}

export interface TarifarioListParams {
  pagina?: number
  limite?: number
  busca?: string
  parceiro_id?: string | null // 'publico' | uuid | undefined
  categoria_quarto_id?: string
  regime_alimentacao_id?: string
  ativo?: boolean
}

export interface CreateTarifarioPayload {
  categoria_quarto_id: string
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  ativo?: boolean
}

export interface UpdateTarifarioPayload {
  categoria_quarto_id?: string
  regime_alimentacao_id?: string
  parceiro_id?: string | null
  nome?: string
  datas?: string[]
  valor_diaria?: string
  ativo?: boolean
}

export interface PeriodoTarifarioCalendario {
  id: string
  categoria_quarto_id: string
  parceiro_id?: string | null
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  datas: string[]
}

export interface CalculoTarifaReservaInput {
  hotel_id: string
  categoria_quarto_id: string
  parceiro_id?: string | null
  check_in: string
  check_out: string
}
