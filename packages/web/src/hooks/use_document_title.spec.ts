import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageTitle } from './use_document_title'

describe('usePageTitle', () => {
  it('sets formatted document.title when title is provided', () => {
    renderHook(() => usePageTitle('Reservas'))
    expect(document.title).toBe('Reservas | HotelMind')
  })

  it('sets fallback document.title when title is undefined or empty', () => {
    renderHook(() => usePageTitle(undefined))
    expect(document.title).toBe('HotelMind')

    renderHook(() => usePageTitle(''))
    expect(document.title).toBe('HotelMind')
  })

  it('updates document.title when title changes dynamically', () => {
    const { rerender } = renderHook(
      ({ title }: { title?: string }) => usePageTitle(title),
      {
        initialProps: { title: undefined },
      }
    )
    expect(document.title).toBe('HotelMind')

    rerender({ title: 'Reserva #123' })
    expect(document.title).toBe('Reserva #123 | HotelMind')
  })
})
