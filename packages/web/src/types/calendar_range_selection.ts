export interface CalendarRangeSelection {
  quarto_id: string
  quarto_identificacao: string
  /** ISO day (AAAA-MM-DD) where the drag started. */
  anchor: string
  /** ISO day (AAAA-MM-DD) where the drag currently is. */
  focus: string
}

export type CellSelectionState = 'none' | 'start' | 'middle' | 'end'

export interface NovaReservaValoresIniciais {
  check_in?: string
  check_out?: string
}

export interface QuartoPreferido {
  id: string
  identificacao: string
}
