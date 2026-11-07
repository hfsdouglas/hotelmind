import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  cents_to_decimal_string,
  decimal_string_to_cents,
  format_cents_to_currency,
  parse_currency_to_cents,
  useCurrencyMask,
} from './use_currency_mask'

describe('useCurrencyMask', () => {
  it('converts between cents, formatted BRL and decimal string', () => {
    expect(cents_to_decimal_string(15000)).toBe('150.00')
    expect(decimal_string_to_cents('150.00')).toBe(15000)
    expect(decimal_string_to_cents('150,50')).toBe(15050)
    expect(parse_currency_to_cents('R$ 150,00')).toBe(15000)
    expect(format_cents_to_currency(15000)).toContain('150,00')
  })

  it('updates cents and formatted string when typing numbers', () => {
    const handleChange = vi.fn()
    const { result } = renderHook(() =>
      useCurrencyMask({ initialValue: '0.00', onChange: handleChange })
    )

    act(() => {
      result.current.handleInputChange('15000')
    })

    expect(result.current.cents).toBe(15000)
    expect(result.current.decimal).toBe('150.00')
    expect(result.current.formatted).toContain('150,00')
    expect(handleChange).toHaveBeenCalledWith('150.00')
  })

  it('sets value programmatically from decimal string', () => {
    const { result } = renderHook(() =>
      useCurrencyMask({ initialValue: '50.00' })
    )

    expect(result.current.cents).toBe(5000)
    expect(result.current.decimal).toBe('50.00')

    act(() => {
      result.current.setValue('320.75')
    })

    expect(result.current.cents).toBe(32075)
    expect(result.current.decimal).toBe('320.75')
  })
})
