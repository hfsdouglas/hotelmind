import type { PaginacaoMeta } from './grupos.js'
import type { CreateLeadPayload } from './leads.js'

export interface NoiteCalculadaOrcamento {
  data: string
  tarifario_id: string
  tarifario_nome: string
  valor_diaria: string
}

export type OrcamentoStatus = 'pendente' | 'aprovado' | 'cancelado' | 'expirado'

export interface Orcamento {
  id: string
  hotel_id: string
  lead_id: string
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas: number
  quantidade_pets: number
  valor_total: string
  detalhamento_noites: NoiteCalculadaOrcamento[]
  token_publico: string
  status: OrcamentoStatus
  observacoes?: string | null
  cupom_desconto?: string | null
  lead?: {
    id: string
    nome: string
    telefone: string
    email: string
  }
  regime_alimentacao?: {
    id: string
    titulo: string
    cor_pulseira: string
  }
  categoria_quarto?: {
    id: string
    nome: string
  }
  criado_em: string
  atualizado_em: string
}

export interface OrcamentoPublicoVisualizacao {
  token_publico: string
  hotel_nome: string
  hotel_telefone?: string
  check_in: string
  check_out: string
  total_noites: number
  quantidade_adultos: number
  quantidade_criancas: number
  quantidade_pets: number
  regime_alimentacao: {
    nome: string
    cor: string
    descricao?: string | null
  }
  categoria_quarto: {
    nome: string
  }
  lead_nome: string
  detalhamento_noites: NoiteCalculadaOrcamento[]
  valor_total: string
  status: OrcamentoStatus
  cupom_desconto?: string | null
  criado_em: string
}

export interface CreateOrcamentoPayload {
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string
  cupom_desconto?: string | null
  lead_id?: string
  lead?: CreateLeadPayload
}

export interface UpdateOrcamentoPayload {
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  check_in?: string
  check_out?: string
  quantidade_adultos?: number
  quantidade_criancas?: number
  quantidade_pets?: number
  observacoes?: string
  cupom_desconto?: string | null
  status?: OrcamentoStatus
}

export interface OrcamentoListParams {
  pagina?: number
  limite?: number
  busca?: string
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  status?: OrcamentoStatus
  data_inicio?: string
  data_fim?: string
}

export interface OrcamentoListResponse {
  data: Orcamento[]
  meta: PaginacaoMeta
}
