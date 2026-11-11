import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import type { AdminSession } from '@/types/auth'
import { Sidebar } from './sidebar'

const mockAdminSession: AdminSession = {
  admin: {
    id: 'admin-1',
    nome_completo: 'Admin Teste',
    email: 'admin@hotelmind.com',
  },
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
            session: mockAdminSession,
            setSession: vi.fn(),
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
  it('renders theme toggle button with light/dark options', async () => {
    localStorage.setItem('theme', 'light')
    renderSidebar()

    const themeButton = screen.getByTitle('Modo escuro')
    expect(themeButton).toBeInTheDocument()

    await act(async () => {
      themeButton.click()
    })

    expect(screen.getByTitle('Modo claro')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
