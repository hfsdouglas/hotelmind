import { describe, expect, it } from 'vitest'
import { mask_phone, unmask_phone } from './use_phone_mask'

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
