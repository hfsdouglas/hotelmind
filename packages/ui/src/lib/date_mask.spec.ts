import { describe, expect, it } from 'vitest'
import {
  date_display_to_iso,
  iso_to_date_display,
  mask_date,
} from './date_mask'

describe('mask_date', () => {
  it('formats progressively as dd/mm/aaaa', () => {
    expect(mask_date('1')).toBe('1')
    expect(mask_date('150')).toBe('15/0')
    expect(mask_date('15032026')).toBe('15/03/2026')
    expect(mask_date('15/03/2026999')).toBe('15/03/2026')
  })
})

describe('date_display_to_iso', () => {
  it('converts a valid display date to ISO', () => {
    expect(date_display_to_iso('15/03/2026')).toBe('2026-03-15')
  })

  it('returns null for incomplete, impossible or out of range dates', () => {
    expect(date_display_to_iso('15/03')).toBeNull()
    expect(date_display_to_iso('31/02/2026')).toBeNull()
    expect(date_display_to_iso('15/13/2026')).toBeNull()
    expect(date_display_to_iso('15/03/1800')).toBeNull()
  })
})

describe('iso_to_date_display', () => {
  it('converts ISO (with or without time) to dd/mm/aaaa', () => {
    expect(iso_to_date_display('2026-03-15')).toBe('15/03/2026')
    expect(iso_to_date_display('2026-03-15T10:00:00Z')).toBe('15/03/2026')
  })

  it('returns an empty string for empty or malformed values', () => {
    expect(iso_to_date_display()).toBe('')
    expect(iso_to_date_display(null)).toBe('')
    expect(iso_to_date_display('2026-03')).toBe('')
  })
})
