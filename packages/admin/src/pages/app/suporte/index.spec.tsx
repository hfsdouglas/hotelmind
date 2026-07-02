import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { render_with_providers } from '@/test/render_with_providers'
import { SuportePage } from './index'
import {
  suporte_hoteis_handlers,
  suporte_hoteis_empty_handler,
  suporte_usuarios_handlers,
  mock_usuarios_hotel,
} from '@/mocks/handlers/suporte_handlers'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mock_session = {
  admin: { id: '1', nome_completo: 'Admin Teste', email: 'admin@hotelmind.com.br' },
}

function setup() {
  localStorage.setItem('hotelmind:admin:session', JSON.stringify(mock_session))
  server.use(...suporte_hoteis_handlers)
  return render_with_providers(<SuportePage />, {
    router_props: { initialEntries: ['/suporte'] },
  })
}

describe('SuportePage', () => {
  it('shows the page heading', () => {
    setup()
    expect(screen.getByRole('heading', { name: /suporte/i })).toBeInTheDocument()
  })

  it('lists only active hotels, excluding inactive ones', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('Furnaspark Resort')).toBeInTheDocument()
    })
    expect(screen.queryByText('Praia Encantada')).not.toBeInTheDocument()
  })

  it('shows result count after data loads', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('1 resultado encontrado')).toBeInTheDocument()
    })
  })

  it('shows empty state when there are no active hotels', async () => {
    localStorage.setItem('hotelmind:admin:session', JSON.stringify(mock_session))
    server.use(suporte_hoteis_empty_handler)
    render_with_providers(<SuportePage />, { router_props: { initialEntries: ['/suporte'] } })
    await waitFor(() => {
      expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()
    })
  })

  it('renders a search bar', () => {
    setup()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  describe('user picker dialog', () => {
    function open_window_spy() {
      return vi.spyOn(window, 'open').mockImplementation(() => null)
    }

    it('lists the hotel\'s users and opens the access URL on confirm', async () => {
      const user = userEvent.setup()
      const open_spy = open_window_spy()
      server.use(...suporte_usuarios_handlers)
      setup()

      await waitFor(() => screen.getByText('Furnaspark Resort'))
      await user.click(screen.getByRole('button', { name: /acessar/i }))

      const dialog = await screen.findByRole('alertdialog')
      expect(within(dialog).getByText(mock_usuarios_hotel[0].nome_completo)).toBeInTheDocument()

      await user.click(within(dialog).getByText(mock_usuarios_hotel[0].nome_completo))
      await user.click(within(dialog).getByRole('button', { name: /^acessar$/i }))

      await waitFor(() => {
        expect(open_spy).toHaveBeenCalledWith(
          expect.stringContaining(`usuario_id=${mock_usuarios_hotel[0].id}`),
          '_blank',
        )
      })
    })

    it('disables confirm and shows a message for a hotel with zero users', async () => {
      const user = userEvent.setup()
      localStorage.setItem('hotelmind:admin:session', JSON.stringify(mock_session))
      server.use(
        ...suporte_usuarios_handlers,
        http.get('http://localhost:3000/admin/hoteis', () =>
          HttpResponse.json({
            data: [{
              id: 'hs-sem-usuarios',
              nome_hotel: 'Sem Usuarios',
              razao_social: 'X',
              nome_fantasia: 'Sem Usuarios',
              cnpj: '00000000000000',
              email_comercial: 'x@x.com',
              telefone_comercial: '11999999999',
              website: null,
              status: 'S',
            }],
            meta: { pagina: 1, limite: 50, total: 1, ultima_pagina: 1 },
          }),
        ),
      )
      render_with_providers(<SuportePage />, { router_props: { initialEntries: ['/suporte'] } })

      await waitFor(() => screen.getByText('Sem Usuarios'))
      await user.click(screen.getByRole('button', { name: /acessar/i }))

      const dialog = await screen.findByRole('alertdialog')
      expect(within(dialog).getByText(/não possui usuários/i)).toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: /^acessar$/i })).toBeDisabled()
    })
  })
})
