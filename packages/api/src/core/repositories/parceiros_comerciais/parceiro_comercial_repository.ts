import type {
  ModeloTarifario,
  ParceiroContatoItem,
  PoliticaFaturamento,
  StatusParceiro,
  TipoParceiro,
  TipoPessoa,
} from '@hotelmind/contracts'
import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface CreateParceiroComercialData {
  hotel_id: string
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

  // Status e Observações
  status?: StatusParceiro
  motivo_bloqueio?: string | null
  observacoes?: string | null

  contatos?: Omit<ParceiroContatoItem, 'id'>[]
}

export interface UpdateParceiroComercialData {
  id: string
  hotel_id: string
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

  // Status e Observações
  status?: StatusParceiro
  motivo_bloqueio?: string | null
  observacoes?: string | null

  contatos?: ParceiroContatoItem[]
}

export interface ParceiroComercialListFilter {
  pagina: number
  limite: number
  busca?: string
  tipo_parceiro?: TipoParceiro
  status?: StatusParceiro
  cidade?: string
  estado?: string
}

export interface IParceiroComercialRepository {
  create(data: CreateParceiroComercialData): Promise<ParceiroComercial>
  update(data: UpdateParceiroComercialData): Promise<ParceiroComercial>
  delete(id: string, hotel_id: string): Promise<void>
  find_by_id(id: string, hotel_id: string): Promise<ParceiroComercial | null>
  find_by_documento(
    documento: string,
    hotel_id: string
  ): Promise<ParceiroComercial | null>
  list(
    hotel_id: string,
    filter: ParceiroComercialListFilter
  ): Promise<PaginatedResult<ParceiroComercial>>
}
