import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import { SidebarUserCard } from './sidebar_user_card'

function renderCard(setSession = vi.fn()) {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider
          value={{
            session: {
              admin: {
                id: 'admin-1',
                nome_completo: 'Admin Teste',
                email: 'admin@hotelmind.com',
              },
            },
            setSession,
            isAuthenticated: true,
          }}
        >
          <MemoryRouter>
            <SidebarUserCard collapsed={false} />
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
  return setSession
}

describe('SidebarUserCard (admin)', () => {
  it('shows the administrator name and the fixed role', () => {
    renderCard()

    expect(screen.getByText('Admin Teste')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('toggles the theme from the menu', async () => {
    const user = userEvent.setup()
    localStorage.setItem('theme', 'light')
    renderCard()

    await user.click(screen.getByRole('button', { name: /Admin Teste/ }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Modo escuro' })
    )

    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    )
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('offers logout as a menu item', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Admin Teste/ }))

    expect(
      await screen.findByRole('menuitem', { name: 'Sair' })
    ).toHaveAttribute('data-variant', 'destructive')
  })
})
