import { render, screen, act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { AuthProvider, AuthContext } from './AuthContext'
import { useContext } from 'react'

const STORAGE_KEY = 'hotelmind:session'

const mockSession = {
  user: {
    id: 'user-1',
    nome_completo: 'Test User',
    email: 'test@example.com',
    hotel_id: 'hotel-1',
    grupos_ids: null,
  },
  hotel: {
    id: 'hotel-1',
    nome_hotel: 'Hotel Teste',
    nome_fantasia: 'Hotel Teste',
    cnpj: '00.000.000/0001-00',
  },
  rotas: [],
}

function AuthConsumer() {
  const ctx = useContext(AuthContext)
  if (!ctx) return <div>no context</div>
  return (
    <div>
      <span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.session?.user.nome_completo ?? 'none'}</span>
      <span data-testid="suporte">{ctx.session?.suporte?.administrador_nome ?? 'none'}</span>
      <button onClick={() => ctx.setSession(mockSession)}>set session</button>
      <button onClick={() => ctx.clearSession()}>clear session</button>
    </div>
  )
}

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('AuthProvider', () => {
  it('starts unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('restores session from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('Test User')
  })

  it('persists session to localStorage when setSession is called', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('set session').click()
    })
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored.user.email).toBe('test@example.com')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
  })

  it('removes session from localStorage when clearSession is called', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('clear session').click()
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('clears session when auth:session-expired event fires', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSession))
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await act(async () => {
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('bootstraps the session from GET /auth/me when localStorage is empty', async () => {
    server.use(
      http.get('http://localhost:3000/auth/me', () =>
        HttpResponse.json({
          user: {
            id: 'user-1',
            nome_completo: 'Bootstrapped User',
            email: 'test@example.com',
            hotel_id: 'hotel-1',
            grupos_ids: null,
          },
          hotel: {
            id: 'hotel-1',
            nome_hotel: 'Hotel Teste',
            nome_fantasia: 'Hotel Teste',
            cnpj: '00.000.000/0001-00',
          },
          rotas: [],
          suporte: { administrador_nome: 'Super Admin' },
        }),
      ),
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('Bootstrapped User')
    expect(screen.getByTestId('suporte')).toHaveTextContent('Super Admin')
  })

  it('stays unauthenticated when GET /auth/me returns 401', async () => {
    server.use(
      http.get('http://localhost:3000/auth/me', () =>
        HttpResponse.json({ message: 'Token inválido!' }, { status: 401 }),
      ),
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('does not call GET /auth/me when a session already exists in localStorage', async () => {
    let called = false
    server.use(
      http.get('http://localhost:3000/auth/me', () => {
        called = true
        return HttpResponse.json({ message: 'should not be called' }, { status: 401 })
      }),
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSession))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(called).toBe(false)
  })
})
