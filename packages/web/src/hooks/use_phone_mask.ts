import { useCallback } from 'react'

/**
 * Aplica a máscara brasileira de telefone:
 * fixo (00) 0000-0000 ou celular (00) 00000-0000
 */
export function mask_phone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function unmask_phone(value: string): string {
  return value.replace(/\D/g, '')
}

export function usePhoneMask() {
  const mask = useCallback((value: string) => mask_phone(value), [])
  const unmask = useCallback((value: string) => unmask_phone(value), [])
  return { mask, unmask }
}
