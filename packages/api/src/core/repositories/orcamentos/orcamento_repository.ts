import type {
  NoiteCalculadaOrcamento,
  OrcamentoStatus,
} from '@hotelmind/contracts'
import type { Orcamento } from '@/core/entities/orcamento'
import type { PaginatedResult } from '@/core/repositories/pagination'

export interface CreateOrcamentoData {
  hotel_id: string
  lead_id: string
  regime_alimentacao_id: string
  categoria_quarto_id: string
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  quantidade_pets?: number
  valor_total: string
  detalhamento_noites: NoiteCalculadaOrcamento[]
  token_publico: string
  status?: OrcamentoStatus
  observacoes?: string | null
  cupom_desconto?: string | null
}

export interface UpdateOrcamentoData {
  id: string
  hotel_id: string
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  check_in?: string
  check_out?: string
  quantidade_adultos?: number
  quantidade_criancas?: number
  quantidade_pets?: number
  valor_total?: string
  detalhamento_noites?: NoiteCalculadaOrcamento[]
  status?: OrcamentoStatus
  observacoes?: string | null
  cupom_desconto?: string | null
}

export interface OrcamentoListFilter {
  pagina: number
  limite: number
  busca?: string
  regime_alimentacao_id?: string
  categoria_quarto_id?: string
  status?: OrcamentoStatus
  data_inicio?: string
  data_fim?: string
}

export interface IOrcamentoRepository {
  create(data: CreateOrcamentoData): Promise<Orcamento>
  update(data: UpdateOrcamentoData): Promise<Orcamento>
  delete(id: string, hotel_id: string): Promise<void>
  find_by_id(id: string, hotel_id: string): Promise<Orcamento | null>
  find_by_token_publico(token: string): Promise<Orcamento | null>
  list(
    hotel_id: string,
    filter: OrcamentoListFilter
  ): Promise<PaginatedResult<Orcamento>>
}
