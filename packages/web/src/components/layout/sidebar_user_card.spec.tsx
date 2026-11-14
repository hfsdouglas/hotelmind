import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import { SidebarUserCard } from './sidebar_user_card'

const session = {
  user: { id: 'u1', nome_completo: 'Operador Teste', email: 'op@hotel.com' },
  hotel: {
    id: 'h1',
    nome_fantasia: 'Hotel Luxo',
    nome_hotel: 'Hotel Luxo LTDA',
  },
  rotas: [],
}

function renderCard(clearSession = vi.fn()) {
  render(
    <ThemeProvider>
      <AuthContext.Provider
        value={{
          session,
          setSession: vi.fn(),
          clearSession,
          isAuthenticated: true,
        }}
      >
        <MemoryRouter>
          <SidebarUserCard collapsed={false} />
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>
  )
  return clearSession
}

describe('SidebarUserCard (web)', () => {
  it('shows the user name and the hotel name without a hardcoded role', () => {
    renderCard()

    expect(screen.getByText('Operador Teste')).toBeInTheDocument()
    expect(screen.getByText('Hotel Luxo')).toBeInTheDocument()
    expect(screen.queryByText('Gerente')).not.toBeInTheDocument()
  })

  it('toggles the theme from the menu', async () => {
    const user = userEvent.setup()
    document.documentElement.classList.remove('dark')
    renderCard()

    await user.click(screen.getByRole('button', { name: /Operador Teste/ }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Modo escuro' })
    )

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('logs out through a button in the menu', async () => {
    const user = userEvent.setup()
    const clearSession = renderCard()

    await user.click(screen.getByRole('button', { name: /Operador Teste/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sair' }))

    await waitFor(() => expect(clearSession).toHaveBeenCalled())
  })
})
