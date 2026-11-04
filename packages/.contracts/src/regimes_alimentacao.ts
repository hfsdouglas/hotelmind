import type { PaginacaoMeta } from './grupos.js'

export interface RegimeAlimentacao {
  id: string
  hotel_id: string
  titulo: string
  descricao: string | null
  cor_pulseira: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface RegimeAlimentacaoListResponse {
  data: RegimeAlimentacao[]
  meta: PaginacaoMeta
}

export interface RegimeAlimentacaoListParams {
  pagina?: number
  limite?: number
  busca?: string
  ativo?: boolean
}

export interface CreateRegimeAlimentacaoPayload {
  titulo: string
  descricao?: string | null
  cor_pulseira: string
  ativo?: boolean
}

export interface UpdateRegimeAlimentacaoPayload {
  titulo?: string
  descricao?: string | null
  cor_pulseira?: string
  ativo?: boolean
}
