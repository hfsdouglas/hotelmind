import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { z } from 'zod'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DECIMAL_VALUE_REGEX = /^\d+(?:\.\d{1,2})?$/

export type CalendarMonthsViewCount = 1 | 3 | 6 | 12
export type CalendarBulkSelectMode = 'all' | 'weekdays' | 'weekends'

export interface CalendarMonthCell {
  iso_date: string
  day_number: number
  is_current_month: boolean
}

export interface VisibleCalendarMonth {
  year: number
  month_zero_based: number
  cells: CalendarMonthCell[]
}

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

export function get_local_today_iso(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function format_dates_summary(datas: string[], max_visible = 3): string {
  if (!datas || datas.length === 0) return 'Nenhuma data'
  const sorted = [...datas].sort()
  const visible = sorted.slice(0, max_visible).map(format_iso_to_br).join(', ')
  const remaining = sorted.length - max_visible
  if (remaining > 0) {
    return `${visible} (+${remaining})`
  }
  return visible
}

export function toggle_date_selection(
  selected_dates: string[],
  iso_date: string
): string[] {
  const set = new Set(selected_dates)
  if (set.has(iso_date)) {
    set.delete(iso_date)
  } else {
    set.add(iso_date)
  }
  return Array.from(set).sort()
}

export function find_conflicting_periods(
  selected_dates: string[],
  periods: PeriodoTarifarioCalendario[],
  exclude_id?: string
): PeriodoTarifarioCalendario[] {
  if (!selected_dates.length) return []
  const selected_set = new Set(selected_dates)
  return periods.filter(period => {
    if (!period.ativo) return false
    if (exclude_id && period.id === exclude_id) return false
    return period.datas.some(d => selected_set.has(d))
  })
}

export function get_calendar_month_grid(
  year: number,
  month_zero_based: number
): CalendarMonthCell[] {
  const first_day = new Date(Date.UTC(year, month_zero_based, 1))
  const start_weekday = first_day.getUTCDay()
  const days_in_month = new Date(
    Date.UTC(year, month_zero_based + 1, 0)
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
      Date.UTC(year, month_zero_based, days_in_month + i)
    )
    cells.push({
      iso_date: next_date.toISOString().slice(0, 10),
      day_number: next_date.getUTCDate(),
      is_current_month: false,
    })
  }

  return cells
}

export function get_visible_calendar_months(
  start_year: number,
  start_month_zero_based: number,
  count: CalendarMonthsViewCount
): VisibleCalendarMonth[] {
  const months: VisibleCalendarMonth[] = []
  for (let offset = 0; offset < count; offset++) {
    const normalized = new Date(
      Date.UTC(start_year, start_month_zero_based + offset, 1)
    )
    const year = normalized.getUTCFullYear()
    const month_zero_based = normalized.getUTCMonth()
    months.push({
      year,
      month_zero_based,
      cells: get_calendar_month_grid(year, month_zero_based),
    })
  }
  return months
}

export function infer_months_count_from_dates(
  selected_dates: string[]
): CalendarMonthsViewCount {
  const valid = selected_dates.filter(is_valid_date_string).sort()
  if (valid.length === 0) return 1

  const [first_y, first_m] = valid[0].split('-').map(Number)
  const [last_y, last_m] = valid[valid.length - 1].split('-').map(Number)
  const span_months = (last_y - first_y) * 12 + (last_m - first_m) + 1

  if (span_months > 6 || valid.length > 180) return 12
  if (span_months > 3 || valid.length > 90) return 6
  if (span_months > 1 || valid.length > 31) return 3
  return 1
}

export function compute_bulk_selection_dates(input: {
  visible_months: Array<{ year: number; month_zero_based: number }>
  mode: CalendarBulkSelectMode
  occupied_periods: PeriodoTarifarioCalendario[]
  exclude_tarifario_id?: string
}): string[] {
  const active_occupied_dates = new Set<string>()
  for (const period of input.occupied_periods) {
    if (!period.ativo) continue
    if (
      input.exclude_tarifario_id &&
      period.id === input.exclude_tarifario_id
    ) {
      continue
    }
    for (const iso_date of period.datas) {
      active_occupied_dates.add(iso_date)
    }
  }

  const selected = new Set<string>()
  for (const { year, month_zero_based } of input.visible_months) {
    const days_in_month = new Date(
      Date.UTC(year, month_zero_based + 1, 0)
    ).getUTCDate()

    for (let day = 1; day <= days_in_month; day++) {
      const date = new Date(Date.UTC(year, month_zero_based, day))
      const iso_date = date.toISOString().slice(0, 10)
      if (active_occupied_dates.has(iso_date)) continue

      const weekday = date.getUTCDay() // 0 = Sun, 1..4 = Mon..Thu, 5 = Fri, 6 = Sat
      const is_hotel_weekend = weekday === 5 || weekday === 6
      if (input.mode === 'weekdays' && is_hotel_weekend) {
        continue
      }
      if (input.mode === 'weekends' && !is_hotel_weekend) {
        continue
      }
      selected.add(iso_date)
    }
  }

  return Array.from(selected).sort()
}

export const tarifario_form_schema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome do tarifário.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  categoria_quarto_id: z
    .string()
    .trim()
    .min(1, 'Selecione uma categoria de quarto.'),
  regime_alimentacao_id: z
    .string()
    .trim()
    .min(1, 'Selecione um regime de alimentação.'),
  datas: z
    .array(z.string().trim().refine(is_valid_date_string, 'Data inválida.'))
    .min(1, 'Selecione ao menos uma data no calendário.'),
  valor_diaria: z
    .string()
    .trim()
    .transform(val => val.replace(',', '.'))
    .refine(
      val => DECIMAL_VALUE_REGEX.test(val) && Number(val) >= 0,
      'Informe um valor de diária válido maior ou igual a zero com até duas casas decimais.'
    ),
  ativo: z.boolean(),
})

export type TarifarioFormValues = z.infer<typeof tarifario_form_schema>
