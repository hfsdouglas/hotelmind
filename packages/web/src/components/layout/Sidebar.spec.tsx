import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Sidebar } from './Sidebar'

const mockSession = {
  user: { id: 'u1', nome_completo: 'Operador Teste', email: 'op@hotel.com' },
  hotel: {
    id: 'h1',
    nome_fantasia: 'Hotel Luxo',
    nome_hotel: 'Hotel Luxo LTDA',
  },
  rotas: [
    {
      id: 'r1',
      modulo: 'Geral',
      recurso: 'Dashboard',
      rota: '/dashboard',
      icone: 'LayoutDashboard',
      ordem: 1,
    },
    {
      id: 'r2',
      modulo: 'Reservas',
      recurso: 'Calendário',
      rota: '/reservas',
      icone: 'CalendarDays',
      ordem: 2,
    },
    {
      id: 'r3',
      modulo: 'Configurações',
      recurso: 'Hotel',
      rota: '/configuracoes/hotel',
      icone: 'Settings',
      ordem: 3,
    },
  ],
}

function renderSidebar(isOpen = true, onClose = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            session: mockSession,
            setSession: vi.fn(),
            clearSession: vi.fn(),
            isAuthenticated: true,
          }}
        >
          <MemoryRouter initialEntries={['/dashboard']}>
            <Sidebar isOpen={isOpen} onClose={onClose} />
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Sidebar', () => {
  it('renders user and hotel information', () => {
    renderSidebar()

    expect(screen.getByText('Hotel Luxo')).toBeInTheDocument()
    expect(screen.getByText('Operador Teste')).toBeInTheDocument()
  })

  it('renders navigation links from rotas', () => {
    renderSidebar()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Calendário')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })
})
