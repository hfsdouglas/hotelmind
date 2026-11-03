import { describe, expect, it } from 'vitest'
import {
  compute_bulk_selection_dates,
  find_conflicting_periods,
  format_dates_summary,
  format_iso_to_br,
  get_local_today_iso,
  get_visible_calendar_months,
  normalize_currency_string,
  tarifario_form_schema,
  toggle_date_selection,
} from './tarifario.schema'

describe('tarifario.schema utilities and form validation', () => {
  it('toggles dates like a checkbox (add on first click, remove on second click) and keeps them sorted', () => {
    let selected = toggle_date_selection([], '2027-03-10')
    expect(selected).toEqual(['2027-03-10'])

    selected = toggle_date_selection(selected, '2027-03-05')
    expect(selected).toEqual(['2027-03-05', '2027-03-10'])

    selected = toggle_date_selection(selected, '2027-03-10')
    expect(selected).toEqual(['2027-03-05'])
  })

  it('normalizes currency strings, computes local today ISO date, and formats BR dates and summaries', () => {
    const local_late_night = new Date(2026, 10, 2, 22, 15, 0) // Nov 2, 2026 at 22:15 local time
    expect(get_local_today_iso(local_late_night)).toBe('2026-11-02')
    expect(normalize_currency_string('350,5')).toBe('350.50')
    expect(format_iso_to_br('2027-03-15')).toBe('15/03/2027')
    expect(
      format_dates_summary([
        '2027-03-01',
        '2027-03-03',
        '2027-03-05',
        '2027-03-07',
      ]),
    ).toBe('01/03/2027, 03/03/2027, 05/03/2027 (+1)')
  })

  it('generates 1, 3, 6, and 12 consecutive visible months including year-end rollover', () => {
    const one = get_visible_calendar_months(2027, 2, 1)
    expect(one).toHaveLength(1)
    expect(one[0].year).toBe(2027)
    expect(one[0].month_zero_based).toBe(2)

    const three = get_visible_calendar_months(2026, 10, 3) // Nov/2026, Dec/2026, Jan/2027
    expect(
      three.map(m => `${m.year}-${String(m.month_zero_based + 1).padStart(2, '0')}`),
    ).toEqual(['2026-11', '2026-12', '2027-01'])

    const six = get_visible_calendar_months(2027, 0, 6)
    expect(six).toHaveLength(6)

    const twelve = get_visible_calendar_months(2027, 0, 12)
    expect(twelve).toHaveLength(12)
    expect(twelve[11].year).toBe(2027)
    expect(twelve[11].month_zero_based).toBe(11)
  })

  it('computes bulk selection dates for all days, hospitality weekdays (Sun-Thu), and hospitality weekends (Fri-Sat) while excluding occupied active dates', () => {
    // March 2027 has 31 days:
    // - Fridays (5, 12, 19, 26) = 4 days
    // - Saturdays (6, 13, 20, 27) = 4 days
    // Total hospitality weekend days (Fri + Sat) = 8 days
    // Total hospitality weekdays (Sun-Thu) = 31 - 8 = 23 days
    const occupied = [
      {
        id: 'occ-1',
        categoria_quarto_id: 'cat-1',
        nome: 'Ocupado Ativo',
        datas: ['2027-03-01', '2027-03-06'], // 2027-03-01 is Monday (weekday), 2027-03-06 is Saturday (weekend)
        valor_diaria: '300.00',
        ativo: true,
      },
      {
        id: 'occ-inativo',
        categoria_quarto_id: 'cat-1',
        nome: 'Inativo',
        datas: ['2027-03-02'],
        valor_diaria: '200.00',
        ativo: false,
      },
    ]

    const all_days = compute_bulk_selection_dates({
      visible_months: [{ year: 2027, month_zero_based: 2 }],
      mode: 'all',
      occupied_periods: occupied,
    })
    expect(all_days).toHaveLength(29) // 31 - 2 active occupied dates
    expect(all_days).not.toContain('2027-03-01')
    expect(all_days).not.toContain('2027-03-06')
    expect(all_days).toContain('2027-03-02') // inactive is still available

    const weekdays = compute_bulk_selection_dates({
      visible_months: [{ year: 2027, month_zero_based: 2 }],
      mode: 'weekdays',
      occupied_periods: occupied,
    })
    expect(weekdays).toHaveLength(22) // 23 Sun-Thu days - 1 occupied Monday (2027-03-01)
    expect(weekdays).not.toContain('2027-03-01')
    expect(weekdays).toContain('2027-03-07') // Sunday is a hospitality weekday!
    expect(weekdays).not.toContain('2027-03-05') // Friday is excluded from weekdays
    expect(weekdays).not.toContain('2027-03-06') // Saturday is excluded from weekdays

    const weekends = compute_bulk_selection_dates({
      visible_months: [{ year: 2027, month_zero_based: 2 }],
      mode: 'weekends',
      occupied_periods: occupied,
    })
    expect(weekends).toHaveLength(7) // 8 Fri/Sat days - 1 occupied Saturday (2027-03-06)
    expect(weekends).not.toContain('2027-03-06')
    expect(weekends).toContain('2027-03-05') // Friday is included in hospitality weekend
    expect(weekends).not.toContain('2027-03-07') // Sunday is excluded from hospitality weekend

    // Multi-month hospitality weekend test (3 months: March, April, May 2027)
    const three_months_weekends = compute_bulk_selection_dates({
      visible_months: [
        { year: 2027, month_zero_based: 2 },
        { year: 2027, month_zero_based: 3 },
        { year: 2027, month_zero_based: 4 },
      ],
      mode: 'weekends',
      occupied_periods: [],
    })
    for (const iso of three_months_weekends) {
      const [y, m, d] = iso.split('-').map(Number)
      const day_of_week = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
      expect([5, 6]).toContain(day_of_week)
    }

    // When editing own rate plan (exclude_tarifario_id = 'occ-1'), own dates are included
    const all_including_self = compute_bulk_selection_dates({
      visible_months: [{ year: 2027, month_zero_based: 2 }],
      mode: 'all',
      occupied_periods: occupied,
      exclude_tarifario_id: 'occ-1',
    })
    expect(all_including_self).toHaveLength(31)
  })

  it('detects conflicts against active occupied dates while ignoring excluded or inactive rate plans', () => {
    const periods = [
      {
        id: 'p-1',
        categoria_quarto_id: 'cat-1',
        nome: 'Dias Úteis Março',
        datas: ['2027-03-01', '2027-03-03'],
        valor_diaria: '200.00',
        ativo: true,
      },
      {
        id: 'p-inativo',
        categoria_quarto_id: 'cat-1',
        nome: 'Inativo',
        datas: ['2027-03-02'],
        valor_diaria: '150.00',
        ativo: false,
      },
    ]

    expect(find_conflicting_periods(['2027-03-02', '2027-03-04'], periods)).toHaveLength(0)
    expect(find_conflicting_periods(['2027-03-03', '2027-03-05'], periods)).toHaveLength(1)
    expect(
      find_conflicting_periods(['2027-03-01', '2027-03-03'], periods, 'p-1'),
    ).toHaveLength(0)
  })

  it('validates tarifario_form_schema requiring at least one selected date', () => {
    expect(
      tarifario_form_schema.safeParse({
        nome: 'Temporada',
        categoria_quarto_id: 'cat-1',
        datas: [],
        valor_diaria: '250.00',
        ativo: true,
      }).success,
    ).toBe(false)

    expect(
      tarifario_form_schema.safeParse({
        nome: 'Temporada',
        categoria_quarto_id: 'cat-1',
        datas: ['2027-03-10', '2027-03-15'],
        valor_diaria: '250,00',
        ativo: true,
      }).success,
    ).toBe(true)
  })
})
