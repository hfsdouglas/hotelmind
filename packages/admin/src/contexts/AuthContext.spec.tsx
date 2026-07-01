import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, AuthContext } from './AuthContext'
import { useContext } from 'react'

const SESSION_KEY = 'hotelmind:admin:session'

const mock_session = {
  admin: { id: '1', nome_completo: 'Admin Teste', email: 'admin@test.com' },
}

function Consumer() {
  const ctx = useContext(AuthContext)
  if (!ctx) return <p>no context</p>
  return (
    <div>
      <p data-testid="authenticated">{String(ctx.isAuthenticated)}</p>
      <p data-testid="name">{ctx.session?.admin.nome_completo ?? 'none'}</p>
      <button onClick={() => ctx.setSession(mock_session)}>set session</button>
      <button onClick={() => ctx.setSession(null)}>clear session</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('name').textContent).toBe('none')
  })

  it('restores session from localStorage on mount', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(mock_session))
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('name').textContent).toBe('Admin Teste')
  })

  it('persists session to localStorage when set', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('set session').click()
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    expect(stored?.admin?.nome_completo).toBe('Admin Teste')
  })

  it('clears localStorage when session is set to null', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(mock_session))
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    await act(async () => {
      screen.getByText('clear session').click()
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('clears session on admin:session-expired event', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(mock_session))
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    await act(async () => {
      window.dispatchEvent(new Event('admin:session-expired'))
    })
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })
})
