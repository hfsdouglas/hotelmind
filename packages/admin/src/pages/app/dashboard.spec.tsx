import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '@/contexts/AuthContext'
import { DashboardPage } from './dashboard'

describe('Admin DashboardPage', () => {
  it('renders dashboard heading and welcome message with admin name', () => {
    render(
      <AuthContext.Provider
        value={{
          session: {
            admin: {
              id: 'a-1',
              nome_completo: 'Mariana Lima',
              email: 'mariana@hotelmind.com',
            },
          },
          setSession: () => {},
          isAuthenticated: true,
        }}
      >
        <DashboardPage />
      </AuthContext.Provider>
    )

    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument()
    expect(screen.getByText('Bem-vindo, Mariana Lima.')).toBeInTheDocument()
  })
})
