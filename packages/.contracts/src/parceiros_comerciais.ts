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

export interface ParceiroComercial {
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

  // Endereço
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

  // Relacionamentos
  contatos?: ParceiroContatoItem[]
}

export interface CreateParceiroComercialPayload {
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

  // Endereço
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  // Regras Comerciais
  modelo_tarifario: ModeloTarifario
  comissao_padrao?: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias?: number
  limite_credito?: number
  allotment_quartos?: number

  observacoes?: string | null
  contatos?: Omit<ParceiroContatoItem, 'id'>[]
}

export interface UpdateParceiroComercialPayload {
  tipo_parceiro?: TipoParceiro
  tipo_pessoa?: TipoPessoa
  razao_social?: string
  nome_fantasia?: string | null
  documento?: string | null
  inscricao_estadual?: string | null
  estrangeiro?: boolean
  cadastur?: string | null
  codigo_iata?: string | null
  registro_embratur?: string | null

  // Endereço
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  pais?: string

  // Regras Comerciais
  modelo_tarifario?: ModeloTarifario
  comissao_padrao?: number
  politica_faturamento?: PoliticaFaturamento
  prazo_pagamento_dias?: number
  limite_credito?: number
  allotment_quartos?: number

  observacoes?: string | null
  contatos?: ParceiroContatoItem[]
}

export interface UpdateStatusParceiroPayload {
  status: StatusParceiro
  motivo_bloqueio?: string | null
}

export interface ParceiroComercialListParams {
  pagina?: number
  limite?: number
  busca?: string
  tipo_parceiro?: TipoParceiro
  status?: StatusParceiro
  cidade?: string
  estado?: string
}

export interface ParceiroComercialListResponse {
  data: ParceiroComercial[]
  meta: PaginacaoMeta
}
