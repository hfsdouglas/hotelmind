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

describe('usePaginacao (web)', () => {
  it('initializes with default values when search params are empty', () => {
    const { result } = renderHook(() => usePaginacao(), {
      wrapper: createWrapper('/'),
    })

    expect(result.current.pagina).toBe(1)
    expect(result.current.limite).toBe(25)
    expect(result.current.busca).toBe('')
    expect(result.current.ordenar_por).toBe('')
    expect(result.current.direcao).toBe('asc')
  })

  it('reads initial values from search params', () => {
    const { result } = renderHook(() => usePaginacao(), {
      wrapper: createWrapper(
        '/?pagina=3&limite=50&busca=hotel&ordenar_por=nome&direcao=desc'
      ),
    })

    expect(result.current.pagina).toBe(3)
    expect(result.current.limite).toBe(50)
    expect(result.current.busca).toBe('hotel')
    expect(result.current.ordenar_por).toBe('nome')
    expect(result.current.direcao).toBe('desc')
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
      result.current.paginacao.setParam('busca', 'copacabana')
    })

    expect(result.current.paginacao.busca).toBe('copacabana')
    expect(result.current.paginacao.pagina).toBe(1)
    expect(result.current.searchParams.get('busca')).toBe('copacabana')
    expect(result.current.searchParams.get('pagina')).toBe('1')
  })

  it('removes param when value is empty string or 0', () => {
    const { result } = renderHook(
      () => {
        const paginacao = usePaginacao()
        const [searchParams] = useSearchParams()
        return { paginacao, searchParams }
      },
      { wrapper: createWrapper('/?busca=reserva&pagina=2') }
    )

    act(() => {
      result.current.paginacao.setParam('busca', '')
    })

    expect(result.current.paginacao.busca).toBe('')
    expect(result.current.searchParams.has('busca')).toBe(false)
    expect(result.current.paginacao.pagina).toBe(1)
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
        status: 'confirmada',
        parceiro_id: '123',
      })
    })

    expect(result.current.searchParams.get('status')).toBe('confirmada')
    expect(result.current.searchParams.get('parceiro_id')).toBe('123')
    expect(result.current.paginacao.pagina).toBe(1)
  })

  it('toggles sort field and direction correctly', () => {
    const { result } = renderHook(
      () => {
        const paginacao = usePaginacao()
        const [searchParams] = useSearchParams()
        return { paginacao, searchParams }
      },
      { wrapper: createWrapper('/') }
    )

    act(() => {
      result.current.paginacao.toggleSort('nome')
    })
    expect(result.current.searchParams.get('ordenar_por')).toBe('nome')
    expect(result.current.searchParams.get('direcao')).toBe('asc')

    act(() => {
      result.current.paginacao.toggleSort('nome')
    })
    expect(result.current.searchParams.get('ordenar_por')).toBe('nome')
    expect(result.current.searchParams.get('direcao')).toBe('desc')
  })
})
