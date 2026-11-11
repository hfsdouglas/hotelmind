import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { server } from '@/mocks/server'
import { useLogout } from './use_logout'

function setup() {
  const setSession = vi.fn()
  const query_client = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={query_client}>
      <AuthContext.Provider
        value={{
          session: null,
          setSession,
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
    </QueryClientProvider>
  )
  return { setSession, ...renderHook(() => useLogout(), { wrapper }) }
}

describe('useLogout', () => {
  it('encerra a sessão e limpa o estado local', async () => {
    const { result, setSession } = setup()

    act(() => result.current.logout())

    await waitFor(() => expect(setSession).toHaveBeenCalledWith(null))
  })

  it('limpa a sessão local mesmo quando o servidor falha', async () => {
    server.use(
      http.post('http://localhost:3000/admin/auth/logout', () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 })
      )
    )
    const { result, setSession } = setup()

    act(() => result.current.logout())

    await waitFor(() => expect(setSession).toHaveBeenCalledWith(null))
  })
})
