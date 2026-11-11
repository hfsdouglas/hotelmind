import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { server } from '@/mocks/server'
import { useLogin } from './use_login'

function setup() {
  const setSession = vi.fn()
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          session: null,
          setSession,
          clearSession: vi.fn(),
          isAuthenticated: false,
        }}
      >
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={children} />
            <Route path="/dashboard" element={<p>dashboard</p>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
  return { setSession, ...renderHook(() => useLogin(), { wrapper }) }
}

describe('useLogin (web)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('salva a sessão do hotel e exibe toast de sucesso com credenciais válidas', async () => {
    const success = vi.spyOn(toast, 'success').mockReturnValue(1)
    const { result, setSession } = setup()

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    await waitFor(() => expect(setSession).toHaveBeenCalledTimes(1))
    expect(setSession.mock.calls[0][0]).toMatchObject({
      hotel: { id: 'hotel-1' },
      user: { hotel_id: 'hotel-1' },
      rotas: [],
    })
    expect(success).toHaveBeenCalledWith('Login realizado com sucesso')
  })

  it('exibe toast de erro e não salva sessão com credenciais inválidas', async () => {
    const error = vi.spyOn(toast, 'error').mockReturnValue(1)
    const { result, setSession } = setup()

    result.current.mutate({ email: 'test@example.com', password: 'errada' })

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith('Email ou senha inválidos')
    )
    expect(setSession).not.toHaveBeenCalled()
  })

  it('indica pendência enquanto a requisição está em andamento', async () => {
    vi.spyOn(toast, 'success').mockReturnValue(1)
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    server.use(
      http.post('http://localhost:3000/auth/login', async () => {
        await gate
        return HttpResponse.json({
          user: { id: 'u', hotel_id: 'hotel-1' },
          hotel: { id: 'hotel-1' },
          message: 'ok',
          rotas: [],
        })
      })
    )
    const { result, setSession } = setup()

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
    expect(setSession).not.toHaveBeenCalled()
    release()
    await waitFor(() => expect(setSession).toHaveBeenCalledTimes(1))
  })
})
