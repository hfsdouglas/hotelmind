import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageTitle } from './use_document_title'

describe('usePageTitle (Admin)', () => {
  it('sets formatted document.title when title is provided', () => {
    renderHook(() => usePageTitle('Hotéis'))
    expect(document.title).toBe('Hotéis | HotelMind Admin')
  })

  it('sets fallback document.title when title is undefined or empty', () => {
    renderHook(() => usePageTitle(undefined))
    expect(document.title).toBe('HotelMind Admin')

    renderHook(() => usePageTitle(''))
    expect(document.title).toBe('HotelMind Admin')
  })

  it('updates document.title when title changes dynamically', () => {
    const { rerender } = renderHook(
      ({ title }: { title?: string }) => usePageTitle(title),
      {
        initialProps: { title: undefined },
      }
    )
    expect(document.title).toBe('HotelMind Admin')

    rerender({ title: 'Editar Hotel' })
    expect(document.title).toBe('Editar Hotel | HotelMind Admin')
  })
})
