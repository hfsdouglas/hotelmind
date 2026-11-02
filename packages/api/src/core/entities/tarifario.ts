import { TarifarioValidationError } from '@/core/errors/tarifario_errors'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DECIMAL_VALUE_REGEX = /^\d+(?:\.\d{1,2})?$/

export function is_valid_iso_date(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false
  const [year_str, month_str, day_str] = value.split('-')
  const year = Number(year_str)
  const month = Number(month_str)
  const day = Number(day_str)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function normalize_valor_diaria(value: string | number): string {
  const raw = typeof value === 'number' ? value.toFixed(2) : value.trim()
  if (!DECIMAL_VALUE_REGEX.test(raw)) {
    throw new TarifarioValidationError(
      'O valor da diária deve ser numérico maior ou igual a zero com até duas casas decimais.',
    )
  }
  const [int_part, frac_part = ''] = raw.split('.')
  const normalized_int = String(Number(int_part))
  const normalized_frac = (frac_part + '00').slice(0, 2)
  return `${normalized_int}.${normalized_frac}`
}

export function valor_diaria_to_cents(value: string): number {
  const normalized = normalize_valor_diaria(value)
  const [int_part, frac_part] = normalized.split('.')
  return Number(int_part) * 100 + Number(frac_part)
}

export function cents_to_valor_diaria(cents: number): string {
  const safe_cents = Math.round(cents)
  const int_part = Math.floor(safe_cents / 100)
  const frac_part = String(safe_cents % 100).padStart(2, '0')
  return `${int_part}.${frac_part}`
}

export interface TarifarioProps {
  id: string
  hotel_id: string
  categoria_quarto_id: string
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  ativo: boolean
  categoria_quarto: { id: string; nome: string; status: 'S' | 'N' }
  criado_em: string
  atualizado_em: string
}

export class Tarifario {
  readonly id: string
  readonly hotel_id: string
  readonly categoria_quarto_id: string
  readonly nome: string
  readonly data_inicio: string
  readonly data_fim: string
  readonly valor_diaria: string
  readonly ativo: boolean
  readonly categoria_quarto: TarifarioProps['categoria_quarto']
  readonly criado_em: string
  readonly atualizado_em: string

  constructor(props: TarifarioProps) {
    const trimmed_nome = props.nome.trim()
    if (!trimmed_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (trimmed_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.',
      )
    }
    if (!is_valid_iso_date(props.data_inicio)) {
      throw new TarifarioValidationError('A data de início é inválida.')
    }
    if (!is_valid_iso_date(props.data_fim)) {
      throw new TarifarioValidationError('A data de término é inválida.')
    }
    if (props.data_inicio >= props.data_fim) {
      throw new TarifarioValidationError(
        'A data de início deve ser anterior à data de término.',
      )
    }
    const normalized_valor = normalize_valor_diaria(props.valor_diaria)

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.categoria_quarto_id = props.categoria_quarto_id
    this.nome = trimmed_nome
    this.data_inicio = props.data_inicio
    this.data_fim = props.data_fim
    this.valor_diaria = normalized_valor
    this.ativo = props.ativo
    this.categoria_quarto = props.categoria_quarto
    this.criado_em = props.criado_em
    this.atualizado_em = props.atualizado_em
  }
}
