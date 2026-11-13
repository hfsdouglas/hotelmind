import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import {
  get_cell_selection_state,
  is_valid_range,
} from '@/lib/calendar_range_selection'
import type {
  CalendarRangeSelection,
  CellSelectionState,
} from '@/types/calendar_range_selection'

interface UseCalendarRangeSelectionOptions {
  regionRefs: ReadonlyArray<RefObject<HTMLElement | null>>
  paused: boolean
}

export function useCalendarRangeSelection({
  regionRefs,
  paused,
}: UseCalendarRangeSelectionOptions) {
  const [selection, setSelection] = useState<CalendarRangeSelection | null>(
    null
  )
  const [isDragging, setIsDragging] = useState(false)
  const regionRefsRef = useRef(regionRefs)
  regionRefsRef.current = regionRefs

  const startDrag = useCallback(
    (quarto: { id: string; identificacao: string }, dia: string) => {
      setSelection({
        quarto_id: quarto.id,
        quarto_identificacao: quarto.identificacao,
        anchor: dia,
        focus: dia,
      })
      setIsDragging(true)
    },
    []
  )

  const extendDrag = useCallback(
    (dia: string) => {
      if (!isDragging) return
      setSelection(current => (current ? { ...current, focus: dia } : current))
    },
    [isDragging]
  )

  const clear = useCallback(() => {
    setSelection(null)
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    function handleMouseUp() {
      setIsDragging(false)
      setSelection(current =>
        current && is_valid_range(current) ? current : null
      )
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging])

  useEffect(() => {
    if (paused) return
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node | null
      const inside = regionRefsRef.current.some(ref =>
        ref.current?.contains(target)
      )
      if (!inside) clear()
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') clear()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [paused, clear])

  const getCellState = useCallback(
    (quarto_id: string, dia: string): CellSelectionState =>
      get_cell_selection_state(selection, quarto_id, dia),
    [selection]
  )

  return {
    selection,
    isDragging,
    startDrag,
    extendDrag,
    clear,
    getCellState,
  }
}
