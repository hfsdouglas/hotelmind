import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import type { AdminSession } from '@/types/auth'
import { Sidebar } from './sidebar'

const STORAGE_KEY = 'suitesync-sidebar-collapsed'

const mockAdminSession: AdminSession = {
  admin: {
    id: 'admin-1',
    nome_completo: 'Admin Teste',
    email: 'admin@hotelmind.com',
  },
}

function renderSidebar(path = '/hoteis/novo') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            session: mockAdminSession,
            setSession: vi.fn(),
            isAuthenticated: true,
          }}
        >
          <MemoryRouter initialEntries={[path]}>
            <Sidebar>
              <p>Conteúdo Admin</p>
            </Sidebar>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Sidebar (admin)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(STORAGE_KEY, 'false')
  })

  it('renders the fixed platform navigation and the active section', () => {
    renderSidebar()

    for (const label of [
      'Dashboard',
      'Hotéis',
      'Rotas',
      'Administradores',
      'Suporte',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('Plataforma')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hotéis' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('uses the brand variant, with the ADMIN badge and the content in main', () => {
    const { container } = renderSidebar()

    expect(
      container.querySelector('[data-sidebar-variant="brand"]')
    ).not.toBeNull()
    expect(screen.getAllByText('ADMIN').length).toBeGreaterThan(0)
    expect(screen.getByRole('main')).toHaveTextContent('Conteúdo Admin')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('shows the administrator in the footer card and moves the theme toggle to its menu', async () => {
    const user = userEvent.setup()
    renderSidebar()

    expect(screen.getByText('Admin Teste')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Admin Teste/ }))
    expect(
      await screen.findByRole('menuitem', { name: 'Modo escuro' })
    ).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument()
  })

  it('persists the collapsed preference', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
  })
})
