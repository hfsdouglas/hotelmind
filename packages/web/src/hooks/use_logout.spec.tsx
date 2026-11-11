import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { server } from '@/mocks/server'
import { useLogout } from './use_logout'

function setup() {
  const clearSession = vi.fn()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        session: null,
        setSession: vi.fn(),
        clearSession,
        isAuthenticated: true,
      }}
    >
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={children} />
          <Route path="/login" element={<p>login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
  return { clearSession, ...renderHook(() => useLogout(), { wrapper }) }
}

describe('useLogout', () => {
  it('encerra a sessão no servidor e limpa a sessão local', async () => {
    const { result, clearSession } = setup()

    await result.current.logout()

    expect(clearSession).toHaveBeenCalledTimes(1)
  })

  it('limpa a sessão local mesmo quando o servidor falha', async () => {
    server.use(
      http.post('http://localhost:3000/auth/logout', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 })
      )
    )
    const { result, clearSession } = setup()

    await result.current.logout()

    await waitFor(() => expect(clearSession).toHaveBeenCalledTimes(1))
  })
})
