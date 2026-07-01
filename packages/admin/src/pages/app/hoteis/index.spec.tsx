import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { render_with_providers } from '@/test/render_with_providers'
import { HoteisPage } from './index'
import { mock_hoteis } from '@/mocks/handlers/hoteis_handlers'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Provide a logged-in session so the page can render inside layouts that check auth
const mock_session = {
  admin: { id: '1', nome_completo: 'Admin Teste', email: 'admin@hotelmind.com.br' },
}

function setup() {
  localStorage.setItem('hotelmind:admin:session', JSON.stringify(mock_session))
  return render_with_providers(<HoteisPage />, {
    router_props: { initialEntries: ['/hoteis'] },
  })
}

describe('HoteisPage', () => {
  it('shows the page heading', async () => {
    setup()
    expect(screen.getByRole('heading', { name: /hotéis/i })).toBeInTheDocument()
  })

  it('renders hotel rows after data loads', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('Grand Palace Hotel')).toBeInTheDocument()
      expect(screen.getByText('Hotel Mar Azul')).toBeInTheDocument()
    })
  })

  it('shows result count after data loads', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('2 resultados encontrados')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching', () => {
    server.use(
      http.get('http://localhost:3000/admin/hoteis', async () => {
        await new Promise(res => setTimeout(res, 200))
        return HttpResponse.json({ data: [], meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 } })
      }),
    )
    setup()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows empty message when API returns no hotels', async () => {
    server.use(
      http.get('http://localhost:3000/admin/hoteis', () =>
        HttpResponse.json({ data: [], meta: { pagina: 1, limite: 50, total: 0, ultima_pagina: 1 } }),
      ),
    )
    setup()
    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
    })
  })

  it('has a link to create a new hotel', () => {
    setup()
    const link = screen.getByRole('link', { name: /novo hotel/i })
    expect(link).toHaveAttribute('href', '/hoteis/novo')
  })

  it('renders edit and routes links for each hotel row', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('Grand Palace Hotel')).toBeInTheDocument()
    })
    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[1] = Grand Palace Hotel
    const first_row = rows[1]
    const edit_link = within(first_row).getByTitle('Editar')
    expect(edit_link.closest('a')).toHaveAttribute('href', `/hoteis/${mock_hoteis[0].id}/editar`)
    const rotas_link = within(first_row).getByTitle('Gerenciar rotas')
    expect(rotas_link.closest('a')).toHaveAttribute('href', `/hoteis/${mock_hoteis[0].id}/rotas`)
  })

  it('calls the delete API when the remove button is confirmed', async () => {
    const user = userEvent.setup()
    let delete_called = false

    server.use(
      http.delete(`http://localhost:3000/admin/hoteis/${mock_hoteis[0].id}`, () => {
        delete_called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    setup()
    await waitFor(() => screen.getByText('Grand Palace Hotel'))

    const rows = screen.getAllByRole('row')
    const first_row = rows[1]
    const remove_button = within(first_row).getByTitle('Remover')
    await user.click(remove_button)

    await waitFor(() => {
      expect(delete_called).toBe(true)
    })
  })
})
