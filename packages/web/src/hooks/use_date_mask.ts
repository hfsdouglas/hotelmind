import {
  date_display_to_iso,
  iso_to_date_display,
  mask_date,
} from '@hotelmind/ui'
import { useCallback } from 'react'

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
