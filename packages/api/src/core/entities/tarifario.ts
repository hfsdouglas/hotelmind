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

export function normalize_datas(datas: string[]): string[] {
  if (!Array.isArray(datas) || datas.length === 0) {
    throw new TarifarioValidationError(
      'Selecione ao menos uma data no calendário.'
    )
  }
  const unique_dates = new Set<string>()
  for (const raw_date of datas) {
    const trimmed = raw_date.trim()
    if (!is_valid_iso_date(trimmed)) {
      throw new TarifarioValidationError(`A data "${raw_date}" é inválida.`)
    }
    unique_dates.add(trimmed)
  }
  return Array.from(unique_dates).sort()
}

export function normalize_valor_diaria(value: string | number): string {
  const raw = typeof value === 'number' ? value.toFixed(2) : value.trim()
  if (!DECIMAL_VALUE_REGEX.test(raw)) {
    throw new TarifarioValidationError(
      'O valor da diária deve ser numérico maior ou igual a zero com até duas casas decimais.'
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
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
  categoria_quarto: { id: string; nome: string; status: 'S' | 'N' }
  regime_alimentacao: {
    id: string
    titulo: string
    cor_pulseira: string
  }
  parceiro?: {
    id: string
    razao_social: string
    nome_fantasia?: string | null
  } | null
  criado_em: string
  atualizado_em: string
}

export class Tarifario {
  readonly id: string
  readonly hotel_id: string
  readonly categoria_quarto_id: string
  readonly regime_alimentacao_id: string
  readonly parceiro_id: string | null
  readonly nome: string
  readonly datas: string[]
  readonly valor_diaria: string
  readonly ativo: boolean
  readonly categoria_quarto: TarifarioProps['categoria_quarto']
  readonly regime_alimentacao: TarifarioProps['regime_alimentacao']
  readonly parceiro: TarifarioProps['parceiro'] | null
  readonly criado_em: string
  readonly atualizado_em: string

  constructor(props: TarifarioProps) {
    const trimmed_nome = props.nome.trim()
    if (!trimmed_nome) {
      throw new TarifarioValidationError('O nome do tarifário é obrigatório.')
    }
    if (trimmed_nome.length > 100) {
      throw new TarifarioValidationError(
        'O nome do tarifário deve ter no máximo 100 caracteres.'
      )
    }
    if (!props.regime_alimentacao_id) {
      throw new TarifarioValidationError(
        'O regime de alimentação é obrigatório.'
      )
    }
    const normalized_datas = normalize_datas(props.datas)
    const normalized_valor = normalize_valor_diaria(props.valor_diaria)

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.categoria_quarto_id = props.categoria_quarto_id
    this.regime_alimentacao_id = props.regime_alimentacao_id
    this.parceiro_id = props.parceiro_id ?? null
    this.nome = trimmed_nome
    this.datas = normalized_datas
    this.valor_diaria = normalized_valor
    this.ativo = props.ativo
    this.categoria_quarto = props.categoria_quarto
    this.regime_alimentacao = props.regime_alimentacao
    this.parceiro = props.parceiro ?? null
    this.criado_em = props.criado_em
    this.atualizado_em = props.atualizado_em
  }
}
