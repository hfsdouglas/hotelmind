import type {
  CalendarRangeSelection,
  CellSelectionState,
} from '@/types/calendar_range_selection'

interface NormalizedRange {
  inicio: string
  fim: string
}

export function to_iso_day(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalize_range(
  selection: CalendarRangeSelection
): NormalizedRange {
  const { anchor, focus } = selection
  return anchor <= focus
    ? { inicio: anchor, fim: focus }
    : { inicio: focus, fim: anchor }
}

export function is_valid_range(selection: CalendarRangeSelection): boolean {
  const { inicio, fim } = normalize_range(selection)
  return inicio !== fim
}

export function range_to_periodo(selection: CalendarRangeSelection): {
  check_in: string
  check_out: string
} {
  const { inicio, fim } = normalize_range(selection)
  return { check_in: inicio, check_out: fim }
}

export function get_cell_selection_state(
  selection: CalendarRangeSelection | null,
  quarto_id: string,
  dia: string
): CellSelectionState {
  if (!selection || selection.quarto_id !== quarto_id) return 'none'
  const { inicio, fim } = normalize_range(selection)
  if (dia < inicio || dia > fim) return 'none'
  if (dia === inicio) return 'start'
  if (dia === fim) return 'end'
  return 'middle'
}

function format_iso_as_br(iso_day: string): string {
  const [year, month, day] = iso_day.split('-')
  return `${day}/${month}/${year}`
}

export function format_range_announcement(
  selection: CalendarRangeSelection | null
): string {
  if (!selection) return ''
  const { inicio, fim } = normalize_range(selection)
  return `Período selecionado: Suíte ${selection.quarto_identificacao}, de ${format_iso_as_br(inicio)} a ${format_iso_as_br(fim)}`
}
