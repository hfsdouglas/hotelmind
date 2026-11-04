import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login'
import { AuthContext } from '@/contexts/AuthContext'

function renderPage(isAuthenticated = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          session: isAuthenticated
            ? {
                user: { id: '1', nome_completo: 'Test', email: 'test@hotel.com' },
                hotel: { id: 'h1', nome_fantasia: 'Hotel Test', nome_hotel: 'Hotel LTDA' },
                rotas: [],
              }
            : null,
          setSession: vi.fn(),
          clearSession: vi.fn(),
          isAuthenticated,
        }}
      >
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  it('renders LoginForm when user is not authenticated', () => {
    renderPage(false)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('redirects when user is already authenticated', () => {
    renderPage(true)
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument()
  })
})
