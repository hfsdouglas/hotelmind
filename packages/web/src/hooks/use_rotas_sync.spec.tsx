import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { server } from '@/mocks/server'
import { useRotasSync } from './use_rotas_sync'

const user = {
  id: 'user-1',
  nome_completo: 'Test User',
  email: 'test@example.com',
  hotel_id: 'hotel-1',
  grupos_ids: null,
}
const hotel = {
  id: 'hotel-1',
  nome_hotel: 'Hotel Teste',
  nome_fantasia: 'Hotel Teste',
  cnpj: '00.000.000/0001-00',
}
const rota = { path: '/reservas' }

function setup(rotas: unknown[], authenticated = true) {
  const setSession = vi.fn()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const session = authenticated ? { user, hotel, rotas } : null
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          session: session as never,
          setSession,
          clearSession: vi.fn(),
          isAuthenticated: authenticated,
        }}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )
  renderHook(() => useRotasSync(), { wrapper })
  return { setSession }
}

describe('useRotasSync', () => {
  it('atualiza a sessão quando as rotas do servidor diferem das locais', async () => {
    server.use(
      http.get('http://localhost:3000/auth/me', () =>
        HttpResponse.json({ user, hotel, rotas: [rota] })
      )
    )
    const { setSession } = setup([])

    await waitFor(() => expect(setSession).toHaveBeenCalledTimes(1))
    expect(setSession.mock.calls[0][0]).toMatchObject({
      hotel: { id: 'hotel-1' },
      rotas: [rota],
    })
  })

  it('não atualiza a sessão quando as rotas são idênticas', async () => {
    let called = false
    server.use(
      http.get('http://localhost:3000/auth/me', () => {
        called = true
        return HttpResponse.json({ user, hotel, rotas: [rota] })
      })
    )
    const { setSession } = setup([rota])

    await waitFor(() => expect(called).toBe(true))
    await new Promise(r => setTimeout(r, 50))
    expect(setSession).not.toHaveBeenCalled()
  })

  it('não consulta o servidor sem sessão', async () => {
    let called = false
    server.use(
      http.get('http://localhost:3000/auth/me', () => {
        called = true
        return HttpResponse.json({ user, hotel, rotas: [] })
      })
    )
    const { setSession } = setup([], false)

    await new Promise(r => setTimeout(r, 50))
    expect(called).toBe(false)
    expect(setSession).not.toHaveBeenCalled()
  })

  it('mantém a sessão quando o servidor falha', async () => {
    server.use(
      http.get('http://localhost:3000/auth/me', () =>
        HttpResponse.json({ message: 'x' }, { status: 401 })
      )
    )
    const { setSession } = setup([rota])

    await new Promise(r => setTimeout(r, 50))
    expect(setSession).not.toHaveBeenCalled()
  })
})
