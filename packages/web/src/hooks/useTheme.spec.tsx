import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'
import { ThemeProvider } from '@/contexts/ThemeContext'

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used inside ThemeProvider',
    )
  })

  it('returns context value when used inside ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    })
    expect(['light', 'dark']).toContain(result.current.theme)
    expect(typeof result.current.toggleTheme).toBe('function')
  })
})
