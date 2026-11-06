import type { PaginacaoMeta } from './grupos.js'

export type TipoParceiro =
  | 'agente_autonomo'
  | 'agencia_viagens'
  | 'operadora_turismo'
  | 'clube_turismo'
  | 'empresa_corporativa'

export type TipoPessoa = 'PF' | 'PJ'
export type ModeloTarifario = 'net' | 'comissionada' | 'acordo'
export type PoliticaFaturamento = 'voucher' | 'faturado' | 'prepago'
export type StatusParceiro = 'ativo' | 'inativo' | 'bloqueado'
export type TipoContatoParceiro = 'comercial' | 'financeiro' | 'operacional'

export interface ParceiroContatoItem {
  id?: string
  tipo_contato: TipoContatoParceiro
  nome: string
  email: string
  telefone: string
  cargo?: string | null
}

export interface ParceiroEndereco {
  id?: string
  parceiro_id?: string
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string
}

export interface ParceiroResumo {
  id: string
  razao_social: string
  nome_fantasia?: string | null
  tipo_parceiro?: TipoParceiro
}

// Mantém formato achatado (flattened) para compatibilidade frontend
export interface Parceiro {
  id: string
  hotel_id: string
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia: string | null
  documento: string | null
  inscricao_estadual: string | null
  estrangeiro: boolean
  cadastur: string | null
  codigo_iata: string | null
  registro_embratur: string | null

  // Endereço (flattened)
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  pais: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao: string
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias: number
  limite_credito: string
  allotment_quartos: number

  // Ciclo de Vida
  status: StatusParceiro
  motivo_bloqueio: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string

  contatos?: ParceiroContatoItem[]
}

export interface CreateParceiroPayload {
  tipo_parceiro: TipoParceiro
  tipo_pessoa: TipoPessoa
  razao_social: string
  nome_fantasia?: string | null
  documento?: string | null
  inscricao_estadual?: string | null
  estrangeiro?: boolean
  cadastur?: string | null
  codigo_iata?: string | null
  registro_embratur?: string | null

  // Endereço (flattened)
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  modelo_tarifario: ModeloTarifario
  comissao_padrao?: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias?: number
  limite_credito?: number
  allotment_quartos?: number

  observacoes?: string | null
  contatos?: Omit<ParceiroContatoItem, 'id'>[]
}

export interface UpdateParceiroPayload extends Partial<CreateParceiroPayload> {
  contatos?: ParceiroContatoItem[]
}

export interface UpdateStatusParceiroPayload {
  status: StatusParceiro
  motivo_bloqueio?: string | null
}

export interface ParceiroListParams {
  pagina?: number
  limite?: number
  busca?: string
  tipo_parceiro?: TipoParceiro
  status?: StatusParceiro
  cidade?: string
  estado?: string
}

export interface ParceiroListResponse {
  data: Parceiro[]
  meta: PaginacaoMeta
}

// Backward Compatibility Aliases
export type ParceiroComercial = Parceiro
export type CreateParceiroComercialPayload = CreateParceiroPayload
export type UpdateParceiroComercialPayload = UpdateParceiroPayload
export type ParceiroComercialListParams = ParceiroListParams
export type ParceiroComercialListResponse = ParceiroListResponse
