import { createContext, useEffect, useState } from 'react'
import type { AuthHotel, AuthUser } from '@/types/auth'

interface AuthSession {
  user: AuthUser
  hotel: AuthHotel
}

interface AuthContextValue {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'hotelmind:session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      return null
    }
  })

  function setSession(s: AuthSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setSessionState(s)
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY)
    setSessionState(null)
  }

  useEffect(() => {
    function handleExpired() {
      clearSession()
      window.location.replace('/login')
    }
    window.addEventListener('auth:session-expired', handleExpired)
    return () => window.removeEventListener('auth:session-expired', handleExpired)
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, setSession, clearSession, isAuthenticated: !!session }}
    >
      {children}
    </AuthContext.Provider>
  )
}
