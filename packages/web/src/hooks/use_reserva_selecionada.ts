import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

interface UseReservaSelecionadaOptions {
  regionRefs: ReadonlyArray<RefObject<HTMLElement | null>>
  paused: boolean
  idsVisiveis: readonly string[]
}

export function useReservaSelecionada({
  regionRefs,
  paused,
  idsVisiveis,
}: UseReservaSelecionadaOptions) {
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null)
  const regionRefsRef = useRef(regionRefs)
  regionRefsRef.current = regionRefs

  const selecionar = useCallback((id: string) => setSelecionadaId(id), [])
  const limpar = useCallback(() => setSelecionadaId(null), [])

  useEffect(() => {
    if (paused) return
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null
      const inside = regionRefsRef.current.some(ref =>
        ref.current?.contains(target)
      )
      if (!inside) setSelecionadaId(null)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelecionadaId(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [paused])

  useEffect(() => {
    setSelecionadaId(current =>
      current !== null && !idsVisiveis.includes(current) ? null : current
    )
  }, [idsVisiveis])

  return { selecionadaId, selecionar, limpar }
}
