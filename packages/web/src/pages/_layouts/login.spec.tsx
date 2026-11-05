import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/AuthContext'
import { LoginLayout } from './login'

function renderWithAuth(isAuthenticated: boolean) {
  return render(
    <AuthContext.Provider
      value={{
        session: isAuthenticated
          ? {
              user: {
                id: 'u1',
                nome_completo: 'Test',
                email: 'test@hotel.com',
              },
              hotel: {
                id: 'h1',
                nome_fantasia: 'Hotel Test',
                nome_hotel: 'Hotel LTDA',
              },
              rotas: [],
            }
          : null,
        setSession: vi.fn(),
        clearSession: vi.fn(),
        isAuthenticated,
      }}
    >
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<LoginLayout />}>
            <Route path="/login" element={<div>Página de Login</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('LoginLayout', () => {
  it('renders child outlet when unauthenticated', () => {
    renderWithAuth(false)
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  it('redirects to root when authenticated', () => {
    renderWithAuth(true)
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })
})
