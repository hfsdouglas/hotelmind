import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { usePaginacao } from './use_paginacao'

function createWrapper(initialEntry = '/') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    )
  }
}

describe('usePaginacao (admin)', () => {
  it('initializes with default values when search params are empty', () => {
    const { result } = renderHook(() => usePaginacao(), {
      wrapper: createWrapper('/'),
    })

    expect(result.current.pagina).toBe(1)
    expect(result.current.limite).toBe(50)
    expect(result.current.busca).toBe('')
    expect(result.current.ordenar_por).toBe('')
    expect(result.current.direcao).toBe('asc')
  })

  it('updates busca and resets pagina to 1 when setParam is called', () => {
    const { result } = renderHook(
      () => {
        const paginacao = usePaginacao()
        const [searchParams] = useSearchParams()
        return { paginacao, searchParams }
      },
      { wrapper: createWrapper('/?pagina=3') }
    )

    act(() => {
      result.current.paginacao.setParam('busca', 'hotel')
    })

    expect(result.current.paginacao.busca).toBe('hotel')
    expect(result.current.paginacao.pagina).toBe(1)
    expect(result.current.searchParams.get('busca')).toBe('hotel')
  })

  it('preserves search term when multiple updates happen sequentially', () => {
    const { result } = renderHook(
      () => {
        const paginacao = usePaginacao()
        const [searchParams] = useSearchParams()
        return { paginacao, searchParams }
      },
      { wrapper: createWrapper('/') }
    )

    act(() => {
      result.current.paginacao.setParam('busca', 'suite')
      result.current.paginacao.setPagina(1)
    })

    expect(result.current.paginacao.busca).toBe('suite')
    expect(result.current.searchParams.get('busca')).toBe('suite')
    expect(result.current.paginacao.pagina).toBe(1)
  })

  it('updates multiple params atomically via setParams and resets pagina', () => {
    const { result } = renderHook(
      () => {
        const paginacao = usePaginacao()
        const [searchParams] = useSearchParams()
        return { paginacao, searchParams }
      },
      { wrapper: createWrapper('/?pagina=4') }
    )

    act(() => {
      result.current.paginacao.setParams({
        status: 'ativo',
        cidade: 'sp',
      })
    })

    expect(result.current.searchParams.get('status')).toBe('ativo')
    expect(result.current.searchParams.get('cidade')).toBe('sp')
    expect(result.current.paginacao.pagina).toBe(1)
  })
})
