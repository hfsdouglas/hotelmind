import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import { AppLayout } from './app'

function renderAdminAppLayout(isAuthenticated: boolean) {
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
                  admin: {
                    id: 'a1',
                    nome_completo: 'Admin Teste',
                    email: 'admin@hotelmind.com',
                  },
                }
              : null,
            setSession: vi.fn(),
            isAuthenticated,
          }}
        >
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/login" element={<div>Tela de Login Admin</div>} />
              <Route element={<AppLayout />}>
                <Route
                  path="/dashboard"
                  element={<div>Conteúdo Admin Dashboard</div>}
                />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Admin AppLayout', () => {
  it('renders child outlet and layout when authenticated', () => {
    renderAdminAppLayout(true)
    expect(screen.getByText('Conteúdo Admin Dashboard')).toBeInTheDocument()
    expect(screen.getAllByText('Suite').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Abrir menu' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo-principal')
  })

  it('redirects to /login when unauthenticated', () => {
    renderAdminAppLayout(false)
    expect(screen.getByText('Tela de Login Admin')).toBeInTheDocument()
  })
})
