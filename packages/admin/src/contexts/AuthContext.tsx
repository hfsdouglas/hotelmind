import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AdminSession } from '@/types/auth'

const SESSION_KEY = 'hotelmind:admin:session'

interface AuthContextValue {
  session: AdminSession | null
  setSession: (session: AdminSession | null) => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AdminSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AdminSession) : null
    } catch {
      return null
    }
  })

  const setSession = useCallback((next: AdminSession | null) => {
    setSessionState(next)
    if (next) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [])

  useEffect(() => {
    const handler = () => setSession(null)
    window.addEventListener('admin:session-expired', handler)
    return () => window.removeEventListener('admin:session-expired', handler)
  }, [setSession])

  return (
    <AuthContext.Provider value={{ session, setSession, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  )
}
