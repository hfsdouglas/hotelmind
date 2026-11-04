import { useCallback } from 'react'

/** Aplica a máscara brasileira de data: dd/mm/aaaa */
export function mask_date(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/** Converte dd/mm/aaaa para YYYY-MM-DD. Retorna null se inválida/incompleta. */
export function date_display_to_iso(display: string): string | null {
  const clean = display.trim()
  if (clean.length !== 10) return null
  const [day_str, month_str, year_str] = clean.split('/')
  const day = Number(day_str)
  const month = Number(month_str)
  const year = Number(year_str)

  if (!day || !month || !year || year < 1900 || year > 2100) return null
  if (month < 1 || month > 12) return null

  const test_date = new Date(year, month - 1, day)
  if (
    test_date.getFullYear() !== year ||
    test_date.getMonth() !== month - 1 ||
    test_date.getDate() !== day
  ) {
    return null
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Converte YYYY-MM-DD para dd/mm/aaaa. */
export function iso_to_date_display(iso?: string | null): string {
  if (!iso) return ''
  const [year, month, day] = iso.split('T')[0].split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

export function useDateMask() {
  const mask = useCallback((value: string) => mask_date(value), [])
  const to_iso = useCallback(
    (display: string) => date_display_to_iso(display),
    []
  )
  const from_iso = useCallback(
    (iso?: string | null) => iso_to_date_display(iso),
    []
  )
  return { mask, to_iso, from_iso }
}
