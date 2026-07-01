import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAuth } from './useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used inside AuthProvider',
    )
  })

  it('returns context value when used inside AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.session).toBeNull()
    expect(typeof result.current.setSession).toBe('function')
    expect(typeof result.current.clearSession).toBe('function')
  })
})
