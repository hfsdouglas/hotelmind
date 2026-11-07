import { useCallback, useRef, useState } from 'react'

export function format_cents_to_currency(cents: number): string {
  const safe_cents = Math.max(0, Math.round(Number.isNaN(cents) ? 0 : cents))
  const reais = safe_cents / 100
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parse_currency_to_cents(value: string | number): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.round(value * 100))
  }
  const digits = value.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function cents_to_decimal_string(cents: number): string {
  const safe_cents = Math.max(0, Math.round(Number.isNaN(cents) ? 0 : cents))
  const int_part = Math.floor(safe_cents / 100)
  const frac_part = String(safe_cents % 100).padStart(2, '0')
  return `${int_part}.${frac_part}`
}

export function decimal_string_to_cents(value: string): number {
  if (!value) return 0
  const cleaned = value.trim().replace(',', '.')
  const num = parseFloat(cleaned)
  if (Number.isNaN(num) || num < 0) return 0
  return Math.round(num * 100)
}

export interface UseCurrencyMaskOptions {
  initialValue?: string | number
  onChange?: (decimalValue: string) => void
}

export function useCurrencyMask({
  initialValue = '0.00',
  onChange,
}: UseCurrencyMaskOptions = {}) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [cents, setCents] = useState<number>(() => {
    return typeof initialValue === 'number'
      ? Math.round(initialValue * 100)
      : decimal_string_to_cents(initialValue)
  })

  const formatted = format_cents_to_currency(cents)
  const decimal = cents_to_decimal_string(cents)

  const handleInputChange = useCallback((inputValue: string) => {
    const next_cents = parse_currency_to_cents(inputValue)
    setCents(next_cents)
    const next_decimal = cents_to_decimal_string(next_cents)
    onChangeRef.current?.(next_decimal)
    return next_decimal
  }, [])

  const setValue = useCallback((val: string | number) => {
    const next_cents =
      typeof val === 'number'
        ? Math.round(val * 100)
        : decimal_string_to_cents(val)
    setCents(next_cents)
    const next_decimal = cents_to_decimal_string(next_cents)
    onChangeRef.current?.(next_decimal)
    return next_decimal
  }, [])

  return {
    cents,
    formatted,
    decimal,
    handleInputChange,
    setValue,
  }
}
