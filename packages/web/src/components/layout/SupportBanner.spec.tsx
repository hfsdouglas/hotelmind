import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SupportBanner } from './SupportBanner'
import { AuthProvider } from '@/contexts/AuthContext'

const STORAGE_KEY = 'hotelmind:session'

const BASE_SESSION = {
  user: {
    id: 'user-1',
    nome_completo: 'Douglas Faria',
    email: 'douglas@furnaspark.com.br',
    hotel_id: 'hotel-1',
    grupos_ids: null,
  },
  hotel: {
    id: 'hotel-1',
    nome_hotel: 'Furnaspark Resort',
    nome_fantasia: 'Furnaspark Resort',
    cnpj: '00000000000000',
  },
  rotas: [],
}

function renderBanner(session: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SupportBanner />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('SupportBanner', () => {
  it('renders nothing for a normal session (no suporte)', () => {
    renderBanner(BASE_SESSION)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders the banner when session.suporte is present', () => {
    renderBanner({ ...BASE_SESSION, suporte: { administrador_nome: 'Super Admin' } })
    expect(screen.getByRole('status')).toHaveTextContent(/Super Admin/)
    expect(screen.getByRole('status')).toHaveTextContent(/Douglas Faria/)
  })

  it('logs out when "Encerrar" is clicked', async () => {
    const user = userEvent.setup()
    renderBanner({ ...BASE_SESSION, suporte: { administrador_nome: 'Super Admin' } })

    await user.click(screen.getByRole('button', { name: /encerrar/i }))

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })
})
