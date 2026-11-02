import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { z } from 'zod'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DECIMAL_VALUE_REGEX = /^\d+(?:\.\d{1,2})?$/

export function is_valid_date_string(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}

export function add_days_iso(iso_date: string, days: number): string {
  const [y, m, d] = iso_date.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/**
 * Converts UI inclusive effective end date (e.g. 2027-03-31)
 * to API/DB exclusive end date (e.g. 2027-04-01) for [data_inicio, data_fim).
 */
export function to_exclusive_end_date(inclusive_end_date: string): string {
  if (!is_valid_date_string(inclusive_end_date)) return inclusive_end_date
  return add_days_iso(inclusive_end_date, 1)
}

/**
 * Converts API/DB exclusive end date (e.g. 2027-04-01)
 * to UI inclusive effective end date (e.g. 2027-03-31).
 */
export function to_inclusive_end_date(exclusive_end_date: string): string {
  if (!is_valid_date_string(exclusive_end_date)) return exclusive_end_date
  return add_days_iso(exclusive_end_date, -1)
}

export function normalize_currency_string(value: string): string {
  const cleaned = value.trim().replace(',', '.')
  if (!DECIMAL_VALUE_REGEX.test(cleaned)) return cleaned
  const [int_part, frac_part = ''] = cleaned.split('.')
  return `${Number(int_part)}.${(frac_part + '00').slice(0, 2)}`
}

export function format_iso_to_br(iso_date: string): string {
  if (!is_valid_date_string(iso_date)) return iso_date
  const [y, m, d] = iso_date.split('-')
  return `${d}/${m}/${y}`
}

export function count_effective_nights(
  start_inclusive: string,
  end_inclusive: string,
): number {
  if (
    !is_valid_date_string(start_inclusive) ||
    !is_valid_date_string(end_inclusive) ||
    end_inclusive < start_inclusive
  ) {
    return 0
  }
  const [sy, sm, sd] = start_inclusive.split('-').map(Number)
  const [ey, em, ed] = end_inclusive.split('-').map(Number)
  const start_ms = Date.UTC(sy, sm - 1, sd)
  const end_ms = Date.UTC(ey, em - 1, ed)
  return Math.round((end_ms - start_ms) / 86_400_000) + 1
}

export function is_day_in_inclusive_range(
  day_iso: string,
  start_inclusive: string,
  end_inclusive: string,
): boolean {
  if (!start_inclusive || !end_inclusive) return false
  return day_iso >= start_inclusive && day_iso <= end_inclusive
}

export function is_day_in_half_open_period(
  day_iso: string,
  data_inicio: string,
  data_fim_exclusiva: string,
): boolean {
  return day_iso >= data_inicio && day_iso < data_fim_exclusiva
}

export function find_conflicting_periods(
  start_inclusive: string,
  end_inclusive: string,
  periods: PeriodoTarifarioCalendario[],
  exclude_id?: string,
): PeriodoTarifarioCalendario[] {
  if (
    !is_valid_date_string(start_inclusive) ||
    !is_valid_date_string(end_inclusive) ||
    end_inclusive < start_inclusive
  ) {
    return []
  }
  const exclusive_end = to_exclusive_end_date(end_inclusive)
  return periods.filter(period => {
    if (!period.ativo) return false
    if (exclude_id && period.id === exclude_id) return false
    return start_inclusive < period.data_fim && exclusive_end > period.data_inicio
  })
}

export interface CalendarMonthCell {
  iso_date: string
  day_number: number
  is_current_month: boolean
}

export function get_calendar_month_grid(
  year: number,
  month_zero_based: number,
): CalendarMonthCell[] {
  const first_day = new Date(Date.UTC(year, month_zero_based, 1))
  const start_weekday = first_day.getUTCDay()
  const days_in_month = new Date(
    Date.UTC(year, month_zero_based + 1, 0),
  ).getUTCDate()

  const cells: CalendarMonthCell[] = []

  for (let i = start_weekday - 1; i >= 0; i--) {
    const prev_date = new Date(Date.UTC(year, month_zero_based, -i))
    cells.push({
      iso_date: prev_date.toISOString().slice(0, 10),
      day_number: prev_date.getUTCDate(),
      is_current_month: false,
    })
  }

  for (let day = 1; day <= days_in_month; day++) {
    const curr_date = new Date(Date.UTC(year, month_zero_based, day))
    cells.push({
      iso_date: curr_date.toISOString().slice(0, 10),
      day_number: day,
      is_current_month: true,
    })
  }

  const remaining = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const next_date = new Date(
      Date.UTC(year, month_zero_based, days_in_month + i),
    )
    cells.push({
      iso_date: next_date.toISOString().slice(0, 10),
      day_number: next_date.getUTCDate(),
      is_current_month: false,
    })
  }

  return cells
}

export const tarifario_form_schema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, 'Informe o nome do tarifário.')
      .max(100, 'O nome deve ter no máximo 100 caracteres.'),
    categoria_quarto_id: z
      .string()
      .trim()
      .min(1, 'Selecione uma categoria de quarto.'),
    data_inicio: z
      .string()
      .trim()
      .refine(is_valid_date_string, 'Informe uma data de início válida.'),
    data_fim_efetiva: z
      .string()
      .trim()
      .refine(is_valid_date_string, 'Informe uma data de término válida.'),
    valor_diaria: z
      .string()
      .trim()
      .transform(val => val.replace(',', '.'))
      .refine(
        val => DECIMAL_VALUE_REGEX.test(val) && Number(val) >= 0,
        'Informe um valor de diária válido maior ou igual a zero com até duas casas decimais.',
      ),
    ativo: z.boolean(),
  })
  .refine(data => data.data_inicio <= data.data_fim_efetiva, {
    message: 'A data de início não pode ser posterior à data de término.',
    path: ['data_fim_efetiva'],
  })

export type TarifarioFormValues = z.infer<typeof tarifario_form_schema>
