import { useSearchParams } from 'react-router-dom'
import { useCallback, useTransition } from 'react'

export interface PaginacaoParams {
  pagina: number
  limite: number
  busca: string
  ordenar_por: string
  direcao: 'asc' | 'desc'
}

export function usePaginacao(defaults?: Partial<PaginacaoParams>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const pagina = Number(searchParams.get('pagina') ?? defaults?.pagina ?? 1)
  const limite = Number(searchParams.get('limite') ?? defaults?.limite ?? 25)
  const busca = searchParams.get('busca') ?? defaults?.busca ?? ''
  const ordenar_por = searchParams.get('ordenar_por') ?? defaults?.ordenar_por ?? ''
  const direcao = (searchParams.get('direcao') as 'asc' | 'desc') ?? defaults?.direcao ?? 'asc'

  const setParam = useCallback(
    (key: string, value: string | number) => {
      startTransition(() => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          if (value === '' || value === 0) {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
          if (key !== 'pagina') next.set('pagina', '1')
          return next
        })
      })
    },
    [setSearchParams, startTransition],
  )

  const setPagina = useCallback(
    (p: number) => {
      startTransition(() => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          next.set('pagina', String(p))
          return next
        })
      })
    },
    [setSearchParams, startTransition],
  )

  const toggleSort = useCallback(
    (campo: string) => {
      startTransition(() => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          const current = prev.get('ordenar_por')
          const currentDir = prev.get('direcao') ?? 'asc'
          if (current === campo) {
            next.set('direcao', currentDir === 'asc' ? 'desc' : 'asc')
          } else {
            next.set('ordenar_por', campo)
            next.set('direcao', 'asc')
          }
          next.set('pagina', '1')
          return next
        })
      })
    },
    [setSearchParams, startTransition],
  )

  return {
    pagina,
    limite,
    busca,
    ordenar_por,
    direcao,
    setParam,
    setPagina,
    toggleSort,
    isPending,
  }
}
