import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/AuthContext'
import { LoginLayout } from './login'

function renderLoginLayout(isAuthenticated: boolean) {
  return render(
    <AuthContext.Provider
      value={{
        session: isAuthenticated
          ? {
              admin: {
                id: 'a1',
                nome_completo: 'Admin',
                email: 'admin@hotelmind.com',
              },
            }
          : null,
        setSession: vi.fn(),
        isAuthenticated,
      }}
    >
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<LoginLayout />}>
            <Route path="/login" element={<div>Formulário Login Admin</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Painel Admin</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Admin LoginLayout', () => {
  it('renders child outlet when unauthenticated', () => {
    renderLoginLayout(false)
    expect(screen.getByText('Formulário Login Admin')).toBeInTheDocument()
  })

  it('redirects to /dashboard when authenticated', () => {
    renderLoginLayout(true)
    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })
})
