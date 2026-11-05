import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppLayout } from './app'

vi.mock('@/hooks/useRotasSync', () => ({
  useRotasSync: vi.fn(),
}))

function renderAppLayout(isAuthenticated: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            session: isAuthenticated
              ? {
                  user: {
                    id: 'u1',
                    nome_completo: 'Operador',
                    email: 'op@hotel.com',
                  },
                  hotel: {
                    id: 'h1',
                    nome_fantasia: 'Hotel Luxo',
                    nome_hotel: 'Hotel Luxo LTDA',
                  },
                  rotas: [],
                }
              : null,
            setSession: vi.fn(),
            clearSession: vi.fn(),
            isAuthenticated,
          }}
        >
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/login" element={<div>Tela de Login</div>} />
              <Route element={<AppLayout />}>
                <Route
                  path="/dashboard"
                  element={<div>Conteúdo do Dashboard</div>}
                />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('AppLayout', () => {
  it('renders child outlet and shell when authenticated', () => {
    renderAppLayout(true)
    expect(screen.getByText('Conteúdo do Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    renderAppLayout(false)
    expect(screen.getByText('Tela de Login')).toBeInTheDocument()
  })
})
