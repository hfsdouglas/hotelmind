import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/contexts/theme_context'
import { useTheme } from './use_theme'

describe('useTheme', () => {
  it('lança erro fora do ThemeProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used inside ThemeProvider'
    )
  })

  it('expõe o tema do ThemeProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    const initial = result.current.theme

    act(() => result.current.toggleTheme())

    expect(result.current.theme).not.toBe(initial)
  })
})
