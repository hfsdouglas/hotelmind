import type { PaginacaoMeta } from './grupos.js'

export interface Lead {
  id: string
  hotel_id: string
  nome: string
  telefone: string
  email: string
  criado_em: string
  atualizado_em: string
}

export interface LeadListResponse {
  data: Lead[]
  meta: PaginacaoMeta
}

export interface LeadListParams {
  pagina?: number
  limite?: number
  busca?: string
}

export interface CreateLeadPayload {
  nome: string
  telefone: string
  email: string
}

export interface UpdateLeadPayload {
  nome?: string
  telefone?: string
  email?: string
}
