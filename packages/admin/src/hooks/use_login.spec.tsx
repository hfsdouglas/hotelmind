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
        value={{ session: null, setSession, isAuthenticated: false }}
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

describe('useLogin (admin)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('salva a sessão do admin e exibe toast de sucesso com credenciais válidas', async () => {
    const success = vi.spyOn(toast, 'success').mockReturnValue(1)
    const { result, setSession } = setup()

    result.current.login({
      email: 'admin@hotelmind.com.br',
      password: 'senha1234',
    })

    await waitFor(() => expect(setSession).toHaveBeenCalledTimes(1))
    expect(setSession).toHaveBeenCalledWith({
      admin: expect.objectContaining({ email: 'admin@hotelmind.com.br' }),
    })
    expect(success).toHaveBeenCalledWith('Login realizado com sucesso.')
  })

  it('exibe toast de erro e não salva sessão com credenciais inválidas', async () => {
    const error = vi.spyOn(toast, 'error').mockReturnValue(1)
    const { result, setSession } = setup()

    result.current.login({
      email: 'admin@hotelmind.com.br',
      password: 'errada',
    })

    await waitFor(() =>
      expect(error).toHaveBeenCalledWith('Credenciais inválidas.')
    )
    expect(setSession).not.toHaveBeenCalled()
  })

  it('isPending fica true durante a requisição e libera ao concluir', async () => {
    vi.spyOn(toast, 'success').mockReturnValue(1)
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    server.use(
      http.post('http://localhost:3000/admin/auth/login', async () => {
        await gate
        return HttpResponse.json({ admin: { id: '1' }, message: 'ok' })
      })
    )
    const { result, setSession } = setup()
    expect(result.current.isPending).toBe(false)

    result.current.login({
      email: 'admin@hotelmind.com.br',
      password: 'senha1234',
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
    expect(setSession).not.toHaveBeenCalled()
    release()
    await waitFor(() => expect(setSession).toHaveBeenCalledTimes(1))
  })
})
