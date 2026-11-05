import type { DiariaReserva, ReservaStatus } from '@hotelmind/contracts'
import type { ReservaHospede } from '@/core/entities/reserva_hospede'
import {
  is_valid_iso_date,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'
import { ReservaValidationError } from '@/core/errors/reserva_errors'

export interface ReservaProps {
  id: string
  hotel_id: string
  codigo: string
  titular_nome: string
  titular_telefone?: string | null
  titular_email?: string | null
  quarto_id: string
  regime_alimentacao_id: string
  parceiro_comercial_id?: string | null
  check_in: string
  check_out: string
  quantidade_adultos: number
  quantidade_criancas?: number
  valor_total: string
  detalhamento_diarias: DiariaReserva[]
  status: ReservaStatus
  token_fnrh: string
  token_fnrh_ativo?: boolean
  fnrh_enviada_em?: Date | string | null
  observacoes?: string | null
  quarto?: {
    id: string
    identificacao: string
    categoria_nome: string
  }
  regime_alimentacao?: {
    id: string
    titulo: string
    cor_pulseira: string
  }
  parceiro_comercial?: {
    id: string
    razao_social: string
  } | null
  hospedes?: ReservaHospede[]
  created_at: Date
  updated_at: Date
}

export class Reserva {
  readonly id: string
  readonly hotel_id: string
  readonly codigo: string
  readonly titular_nome: string
  readonly titular_telefone: string | null
  readonly titular_email: string | null
  readonly quarto_id: string
  readonly regime_alimentacao_id: string
  readonly parceiro_comercial_id: string | null
  readonly check_in: string
  readonly check_out: string
  readonly quantidade_adultos: number
  readonly quantidade_criancas: number
  readonly valor_total: string
  readonly detalhamento_diarias: DiariaReserva[]
  readonly status: ReservaStatus
  readonly token_fnrh: string
  readonly token_fnrh_ativo: boolean
  readonly fnrh_enviada_em: Date | null
  readonly observacoes: string | null
  readonly quarto?: ReservaProps['quarto']
  readonly regime_alimentacao?: ReservaProps['regime_alimentacao']
  readonly parceiro_comercial?: ReservaProps['parceiro_comercial']
  readonly hospedes?: ReservaHospede[]
  readonly created_at: Date
  readonly updated_at: Date

  constructor(props: ReservaProps) {
    const nome = props.titular_nome?.trim()
    if (!nome || nome.length < 2) {
      throw new ReservaValidationError(
        'O nome do titular é obrigatório e deve ter pelo menos 2 caracteres.'
      )
    }

    if (props.titular_email) {
      const email = props.titular_email.trim()
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ReservaValidationError('O e-mail do titular é inválido.')
      }
    }

    if (!props.quarto_id) {
      throw new ReservaValidationError('A suíte (quarto) é obrigatória.')
    }

    if (!props.regime_alimentacao_id) {
      throw new ReservaValidationError('O regime de alimentação é obrigatório.')
    }

    if (!is_valid_iso_date(props.check_in)) {
      throw new ReservaValidationError('A data de check-in é inválida.')
    }

    if (!is_valid_iso_date(props.check_out)) {
      throw new ReservaValidationError('A data de check-out é inválida.')
    }

    if (props.check_in >= props.check_out) {
      throw new ReservaValidationError(
        'A data de check-out deve ser posterior à data de check-in.'
      )
    }

    if (props.quantidade_adultos < 1) {
      throw new ReservaValidationError('Informe pelo menos 1 hóspede adulto.')
    }

    const criancas = props.quantidade_criancas ?? 0
    if (criancas < 0) {
      throw new ReservaValidationError(
        'A quantidade de crianças não pode ser negativa.'
      )
    }

    if (!props.token_fnrh) {
      throw new ReservaValidationError(
        'O token exclusivo da FNRH é obrigatório.'
      )
    }

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.codigo = props.codigo
    this.titular_nome = nome
    this.titular_telefone = props.titular_telefone?.trim() || null
    this.titular_email = props.titular_email?.trim() || null
    this.quarto_id = props.quarto_id
    this.regime_alimentacao_id = props.regime_alimentacao_id
    this.parceiro_comercial_id = props.parceiro_comercial_id || null
    this.check_in = props.check_in
    this.check_out = props.check_out
    this.quantidade_adultos = props.quantidade_adultos
    this.quantidade_criancas = criancas
    this.valor_total = normalize_valor_diaria(props.valor_total)
    this.detalhamento_diarias = props.detalhamento_diarias || []
    this.status = props.status
    this.token_fnrh = props.token_fnrh
    this.token_fnrh_ativo = props.token_fnrh_ativo ?? true
    this.fnrh_enviada_em = props.fnrh_enviada_em
      ? new Date(props.fnrh_enviada_em)
      : null
    this.observacoes = props.observacoes?.trim() || null
    this.quarto = props.quarto
    this.regime_alimentacao = props.regime_alimentacao
    this.parceiro_comercial = props.parceiro_comercial
    this.hospedes = props.hospedes
    this.created_at = props.created_at
    this.updated_at = props.updated_at
  }

  get total_hospedes(): number {
    return this.quantidade_adultos + this.quantidade_criancas
  }

  get fichas_preenchidas(): number {
    if (!this.hospedes) return 0
    return this.hospedes.filter(h => h.ficha_status === 'preenchida').length
  }
}
