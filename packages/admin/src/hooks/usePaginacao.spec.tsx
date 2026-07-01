import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { usePaginacao } from './usePaginacao'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('usePaginacao', () => {
  it('returns default values when no search params are present', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    expect(result.current.pagina).toBe(1)
    expect(result.current.limite).toBe(50)
    expect(result.current.busca).toBe('')
    expect(result.current.ordenar_por).toBe('')
    expect(result.current.direcao).toBe('asc')
  })

  it('uses provided defaults when params are absent', () => {
    const { result } = renderHook(
      () => usePaginacao({ pagina: 2, limite: 100, busca: 'hotel', direcao: 'desc' }),
      { wrapper },
    )
    expect(result.current.pagina).toBe(2)
    expect(result.current.limite).toBe(100)
    expect(result.current.busca).toBe('hotel')
    expect(result.current.direcao).toBe('desc')
  })

  it('setParam updates a query param and resets pagina to 1', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.setParam('busca', 'grand')
    })
    expect(result.current.busca).toBe('grand')
    expect(result.current.pagina).toBe(1)
  })

  it('setParam removes a URL param so the value falls back to the empty default', () => {
    // First set busca via setParam so it lives in the URL params
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.setParam('busca', 'grand')
    })
    expect(result.current.busca).toBe('grand')

    // Clearing it should remove it from the URL; with no default, it falls back to ''
    act(() => {
      result.current.setParam('busca', '')
    })
    expect(result.current.busca).toBe('')
  })

  it('setPagina updates only the pagina param', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.setPagina(3)
    })
    expect(result.current.pagina).toBe(3)
    expect(result.current.busca).toBe('')
  })

  it('toggleSort sets ordenar_por and defaults direcao to asc for new field', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.toggleSort('nome_fantasia')
    })
    expect(result.current.ordenar_por).toBe('nome_fantasia')
    expect(result.current.direcao).toBe('asc')
  })

  it('toggleSort flips direcao when the same field is toggled again', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.toggleSort('nome_fantasia')
    })
    act(() => {
      result.current.toggleSort('nome_fantasia')
    })
    expect(result.current.ordenar_por).toBe('nome_fantasia')
    expect(result.current.direcao).toBe('desc')
  })

  it('toggleSort changes to a new field and resets direcao to asc', () => {
    const { result } = renderHook(() => usePaginacao(), { wrapper })
    act(() => {
      result.current.toggleSort('nome_fantasia')
    })
    act(() => {
      result.current.toggleSort('nome_fantasia')
    })
    // direcao is desc now; switching field should reset to asc
    act(() => {
      result.current.toggleSort('cnpj')
    })
    expect(result.current.ordenar_por).toBe('cnpj')
    expect(result.current.direcao).toBe('asc')
  })
})
