import type { PaginacaoMeta } from './grupos.js'

export const TIPOS_CAMA = ['solteiro', 'casal', 'queen', 'king', 'beliche', 'sofa_cama'] as const
export type TipoCama = (typeof TIPOS_CAMA)[number]

export interface ConfiguracaoCama {
  id: string
  tipo: TipoCama
  quantidade: number
}

export interface CategoriaQuartoResumo {
  id: string
  nome: string
  status: 'S' | 'N'
}

export interface Quarto {
  id: string
  hotel_id: string
  categoria_id: string
  identificacao: string
  descricao: string | null
  limite_hospedes: number
  status: 'S' | 'N'
  categoria: CategoriaQuartoResumo
  camas: ConfiguracaoCama[]
  created_at: string
  updated_at: string
}

export interface QuartoListResponse {
  data: Quarto[]
  meta: PaginacaoMeta
}

export interface QuartoListParams {
  pagina?: number
  limite?: number
  busca?: string
  categoria_id?: string
  status?: 'S' | 'N'
}

export interface CreateQuartoPayload {
  categoria_id: string
  identificacao: string
  descricao?: string
  limite_hospedes: number
  camas: Array<{ tipo: TipoCama; quantidade: number }>
}

export interface UpdateQuartoPayload extends CreateQuartoPayload {
  status: 'S' | 'N'
}
