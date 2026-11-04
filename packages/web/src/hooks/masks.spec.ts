import { describe, expect, it } from 'vitest'
import {
  date_display_to_iso,
  iso_to_date_display,
  mask_date,
} from './use_date_mask'
import { mask_phone, unmask_phone } from './use_phone_mask'

describe('mask_date', () => {
  it('formats progressively as dd/mm/aaaa', () => {
    expect(mask_date('1')).toBe('1')
    expect(mask_date('150')).toBe('15/0')
    expect(mask_date('15032026')).toBe('15/03/2026')
    expect(mask_date('15/03/2026999')).toBe('15/03/2026')
  })
  it('converts between display and ISO', () => {
    expect(date_display_to_iso('15/03/2026')).toBe('2026-03-15')
    expect(date_display_to_iso('31/02/2026')).toBeNull()
    expect(iso_to_date_display('2026-03-15')).toBe('15/03/2026')
  })
})

describe('mask_phone', () => {
  it('formats landline and mobile numbers', () => {
    expect(mask_phone('37')).toBe('(37')
    expect(mask_phone('3799')).toBe('(37) 99')
    expect(mask_phone('3732221111')).toBe('(37) 3222-1111')
    expect(mask_phone('37999990000')).toBe('(37) 99999-0000')
    expect(mask_phone('379999900001234')).toBe('(37) 99999-0000')
  })
  it('unmasks to digits', () => {
    expect(unmask_phone('(37) 99999-0000')).toBe('37999990000')
  })
})
