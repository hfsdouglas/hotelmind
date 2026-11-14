import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import { Sidebar } from './sidebar'

const STORAGE_KEY = 'suitesync-sidebar-collapsed'

const rotas = [
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
    rota: '/reservas/calendario',
    icone: 'CalendarDays',
    ordem: 2,
  },
  {
    id: 'r3',
    modulo: 'Reservas',
    recurso: 'Lista',
    rota: '/reservas',
    icone: 'CalendarDays',
    ordem: 3,
  },
  {
    id: 'r4',
    modulo: 'Configurações',
    recurso: 'Hotel',
    rota: '/configuracoes/hotel',
    icone: 'Settings',
    ordem: 4,
  },
]

function renderSidebar(
  overrides: Record<string, unknown> = {},
  path = '/dashboard'
) {
  const session = {
    user: { id: 'u1', nome_completo: 'Operador Teste', email: 'op@hotel.com' },
    hotel: {
      id: 'h1',
      nome_fantasia: 'Hotel Luxo',
      nome_hotel: 'Hotel Luxo LTDA',
    },
    rotas,
    ...overrides,
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            session,
            setSession: vi.fn(),
            clearSession: vi.fn(),
            isAuthenticated: true,
          }}
        >
          <MemoryRouter initialEntries={[path]}>
            <Sidebar>
              <p>Conteúdo</p>
            </Sidebar>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Sidebar (web)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(STORAGE_KEY, 'false')
  })

  it('renders the user and hotel information in the footer card', () => {
    renderSidebar()

    expect(screen.getByText('Operador Teste')).toBeInTheDocument()
    expect(screen.getByText('Hotel Luxo')).toBeInTheDocument()
    expect(screen.queryByText('Gerente')).not.toBeInTheDocument()
  })

  it('renders navigation from session.rotas, flat for single resources and grouped otherwise', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(screen.getByRole('link', { name: 'Hotel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reservas' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('marks the current route and opens its group', () => {
    renderSidebar({}, '/reservas/calendario')

    expect(screen.getByRole('button', { name: 'Reservas' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('link', { name: 'Calendário' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('keeps the content, with no top navbar and no logout anchor', () => {
    renderSidebar()

    expect(screen.getByRole('main')).toHaveTextContent('Conteúdo')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(document.querySelector('a[href="#logout"]')).toBeNull()
  })

  it('persists the collapsed preference under the SuiteSync key', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
  })

  it('shows the support banner when the session is in support mode', () => {
    renderSidebar({ suporte: { administrador_nome: 'Super Admin' } })

    expect(screen.getByRole('status')).toHaveTextContent(/Super Admin/)
  })

  it('exposes the notifications bell', () => {
    renderSidebar()

    expect(
      screen.getAllByRole('button', { name: /Notificações/ }).length
    ).toBeGreaterThan(0)
  })
})
