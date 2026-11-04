import type {
  NoiteCalculadaOrcamento,
  OrcamentoStatus,
} from '@hotelmind/contracts'
import {
  is_valid_iso_date,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'
import { OrcamentoValidationError } from '@/core/errors/orcamento_errors'

export interface OrcamentoProps {
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
  hotel?: {
    id: string
    nome_fantasia?: string | null
    nome_hotel?: string | null
    telefone_comercial?: string | null
  }
  regime_alimentacao?: {
    id: string
    titulo: string
    cor_pulseira: string
    descricao?: string | null
  }
  categoria_quarto?: {
    id: string
    nome: string
  }
  created_at: Date
  updated_at: Date
}

export class Orcamento {
  readonly id: string
  readonly hotel_id: string
  readonly lead_id: string
  readonly regime_alimentacao_id: string
  readonly categoria_quarto_id: string
  readonly check_in: string
  readonly check_out: string
  readonly quantidade_adultos: number
  readonly quantidade_criancas: number
  readonly quantidade_pets: number
  readonly valor_total: string
  readonly detalhamento_noites: NoiteCalculadaOrcamento[]
  readonly token_publico: string
  readonly status: OrcamentoStatus
  readonly observacoes?: string | null
  readonly cupom_desconto?: string | null
  readonly lead?: OrcamentoProps['lead']
  readonly hotel?: OrcamentoProps['hotel']
  readonly regime_alimentacao?: OrcamentoProps['regime_alimentacao']
  readonly categoria_quarto?: OrcamentoProps['categoria_quarto']
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: OrcamentoProps) {
    if (!props.lead_id) {
      throw new OrcamentoValidationError('O lead é obrigatório.')
    }
    if (!props.regime_alimentacao_id) {
      throw new OrcamentoValidationError(
        'O regime de alimentação é obrigatório.'
      )
    }
    if (!props.categoria_quarto_id) {
      throw new OrcamentoValidationError(
        'A categoria de acomodação é obrigatória.'
      )
    }
    if (!is_valid_iso_date(props.check_in)) {
      throw new OrcamentoValidationError('A data de check-in é inválida.')
    }
    if (!is_valid_iso_date(props.check_out)) {
      throw new OrcamentoValidationError('A data de check-out é inválida.')
    }
    if (props.check_in >= props.check_out) {
      throw new OrcamentoValidationError(
        'A data de check-out deve ser posterior à data de check-in.'
      )
    }
    if (props.quantidade_adultos < 1) {
      throw new OrcamentoValidationError('Informe pelo menos 1 hóspede adulto.')
    }
    if (props.quantidade_criancas < 0) {
      throw new OrcamentoValidationError(
        'A quantidade de crianças não pode ser negativa.'
      )
    }
    if (props.quantidade_pets < 0) {
      throw new OrcamentoValidationError(
        'A quantidade de pets não pode ser negativa.'
      )
    }
    if (!props.token_publico) {
      throw new OrcamentoValidationError(
        'O token público do orçamento é obrigatório.'
      )
    }

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.lead_id = props.lead_id
    this.regime_alimentacao_id = props.regime_alimentacao_id
    this.categoria_quarto_id = props.categoria_quarto_id
    this.check_in = props.check_in
    this.check_out = props.check_out
    this.quantidade_adultos = props.quantidade_adultos
    this.quantidade_criancas = props.quantidade_criancas ?? 0
    this.quantidade_pets = props.quantidade_pets ?? 0
    this.valor_total = normalize_valor_diaria(props.valor_total)
    this.detalhamento_noites = props.detalhamento_noites
    this.token_publico = props.token_publico
    this.status = props.status
    this.observacoes = props.observacoes
    this.cupom_desconto = props.cupom_desconto
    this.lead = props.lead
    this.hotel = props.hotel
    this.regime_alimentacao = props.regime_alimentacao
    this.categoria_quarto = props.categoria_quarto
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }
}
