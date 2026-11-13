import { describe, expect, it } from 'vitest'
import type { CalendarRangeSelection } from '@/types/calendar_range_selection'
import {
  format_range_announcement,
  get_cell_selection_state,
  is_valid_range,
  normalize_range,
  range_to_periodo,
  to_iso_day,
} from './calendar_range_selection'

function make_selection(
  overrides: Partial<CalendarRangeSelection> = {}
): CalendarRangeSelection {
  return {
    quarto_id: 'quarto-a',
    quarto_identificacao: '101',
    anchor: '2026-12-20',
    focus: '2026-12-23',
    ...overrides,
  }
}

describe('to_iso_day', () => {
  it('uses the local date, never the UTC date', () => {
    expect(to_iso_day(new Date(2026, 11, 1))).toBe('2026-12-01')
    expect(to_iso_day(new Date(2026, 11, 1, 23, 59))).toBe('2026-12-01')
    expect(to_iso_day(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('normalize_range', () => {
  it('keeps the order when dragging forward', () => {
    expect(normalize_range(make_selection())).toEqual({
      inicio: '2026-12-20',
      fim: '2026-12-23',
    })
  })

  it('swaps anchor and focus when dragging backward', () => {
    const selection = make_selection({
      anchor: '2026-12-23',
      focus: '2026-12-20',
    })

    expect(normalize_range(selection)).toEqual({
      inicio: '2026-12-20',
      fim: '2026-12-23',
    })
  })
})

describe('is_valid_range', () => {
  it('is false for a single day', () => {
    const selection = make_selection({
      anchor: '2026-12-20',
      focus: '2026-12-20',
    })

    expect(is_valid_range(selection)).toBe(false)
  })

  it('is true for two or more days in either direction', () => {
    expect(
      is_valid_range(
        make_selection({ anchor: '2026-12-20', focus: '2026-12-21' })
      )
    ).toBe(true)
    expect(
      is_valid_range(
        make_selection({ anchor: '2026-12-23', focus: '2026-12-20' })
      )
    ).toBe(true)
  })
})

describe('range_to_periodo', () => {
  it('maps the earliest day to check_in and the latest to check_out', () => {
    const selection = make_selection({
      anchor: '2026-12-23',
      focus: '2026-12-20',
    })

    expect(range_to_periodo(selection)).toEqual({
      check_in: '2026-12-20',
      check_out: '2026-12-23',
    })
  })
})

describe('get_cell_selection_state', () => {
  const selection = make_selection()

  it('is none when there is no selection', () => {
    expect(get_cell_selection_state(null, 'quarto-a', '2026-12-21')).toBe(
      'none'
    )
  })

  it('is none for another suite, even on a selected day', () => {
    expect(get_cell_selection_state(selection, 'quarto-b', '2026-12-21')).toBe(
      'none'
    )
  })

  it('is none outside the range', () => {
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-19')).toBe(
      'none'
    )
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-24')).toBe(
      'none'
    )
  })

  it('marks start, middle and end days', () => {
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-20')).toBe(
      'start'
    )
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-21')).toBe(
      'middle'
    )
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-22')).toBe(
      'middle'
    )
    expect(get_cell_selection_state(selection, 'quarto-a', '2026-12-23')).toBe(
      'end'
    )
  })

  it('normalizes a backward selection', () => {
    const backward = make_selection({
      anchor: '2026-12-23',
      focus: '2026-12-20',
    })

    expect(get_cell_selection_state(backward, 'quarto-a', '2026-12-20')).toBe(
      'start'
    )
    expect(get_cell_selection_state(backward, 'quarto-a', '2026-12-23')).toBe(
      'end'
    )
  })

  it('is start for the single cell when anchor equals focus', () => {
    const single = make_selection({ anchor: '2026-12-20', focus: '2026-12-20' })

    expect(get_cell_selection_state(single, 'quarto-a', '2026-12-20')).toBe(
      'start'
    )
  })
})

describe('format_range_announcement', () => {
  it('announces the suite and the dd/mm/yyyy period', () => {
    expect(format_range_announcement(make_selection())).toBe(
      'Período selecionado: Suíte 101, de 20/12/2026 a 23/12/2026'
    )
  })
})
