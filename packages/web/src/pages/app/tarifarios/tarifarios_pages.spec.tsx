import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { EditarTarifarioPage } from './[id]/editar'
import { TarifariosPage } from './index'

const BASE_URL = 'http://localhost:3000'

const sample_tarifario = {
  id: 'tarifario-1',
  hotel_id: 'hotel-1',
  categoria_quarto_id: 'cat-1',
  nome: 'Alta Temporada Verão',
  data_inicio: '2027-01-01',
  data_fim: '2027-02-01',
  valor_diaria: '450.00',
  ativo: true,
  categoria_quarto: { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' as const },
  criado_em: '2026-11-02T12:00:00.000Z',
  atualizado_em: '2026-11-02T12:00:00.000Z',
}

function create_wrapper(initial_entry = '/tarifarios') {
  const query_client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initial_entry]}>
      <QueryClientProvider client={query_client}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Tarifarios Pages (List & Edit)', () => {
  it('RF01: renders rate plan list with inclusive effective end date, currency and actions', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [{ id: 'cat-1', hotel_id: 'hotel-1', nome: 'Suítes Luxo', status: 'S', created_at: '', updated_at: '' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        }),
      ),
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [sample_tarifario],
          meta: { pagina: 1, limite: 25, total: 1, ultima_pagina: 1 },
        }),
      ),
    )

    render(<TarifariosPage />, { wrapper: create_wrapper('/tarifarios') })

    expect(
      await screen.findByText('Alta Temporada Verão'),
    ).toBeInTheDocument()
    expect(screen.getByText('Suítes Luxo')).toBeInTheDocument()
    expect(screen.getByText('01/01/2027')).toBeInTheDocument()
    // Exclusive 2027-02-01 displayed as inclusive 31/01/2027
    expect(screen.getByText('31/01/2027')).toBeInTheDocument()
    expect(screen.getByText('R$ 450.00')).toBeInTheDocument()
  })

  it('CA07 & CA08: loads edit page without self-conflict and requires confirmation before deactivation', async () => {
    let deactivate_called = false

    server.use(
      http.get(`${BASE_URL}/tarifarios/tarifario-1`, () =>
        HttpResponse.json(sample_tarifario),
      ),
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [{ id: 'cat-1', hotel_id: 'hotel-1', nome: 'Suítes Luxo', status: 'S', created_at: '', updated_at: '' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        }),
      ),
      http.get(`${BASE_URL}/tarifarios/calendario`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'tarifario-1',
              categoria_quarto_id: 'cat-1',
              nome: 'Alta Temporada Verão',
              data_inicio: '2027-01-01',
              data_fim: '2027-02-01',
              valor_diaria: '450.00',
              ativo: true,
            },
          ],
        }),
      ),
      http.patch(`${BASE_URL}/tarifarios/tarifario-1/desativar`, () => {
        deactivate_called = true
        return HttpResponse.json({ ...sample_tarifario, ativo: false })
      }),
    )

    const query_client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <MemoryRouter initialEntries={['/tarifarios/tarifario-1/editar']}>
        <QueryClientProvider client={query_client}>
          <Routes>
            <Route
              path="/tarifarios/:id/editar"
              element={<EditarTarifarioPage />}
            />
            <Route path="/tarifarios" element={<div>Listagem</div>} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByDisplayValue('Alta Temporada Verão'),
    ).toBeInTheDocument()

    // Own period must NOT trigger conflict alert
    expect(
      screen.queryByTestId('period-conflict-alert'),
    ).not.toBeInTheDocument()

    // Click deactivate button -> opens confirmation AlertDialog
    fireEvent.click(
      screen.getByRole('button', { name: /desativar tarifário/i }),
    )
    expect(
      await screen.findByText(/desativar tarifário\?/i),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /confirmar desativação/i }),
    )

    await waitFor(() => {
      expect(deactivate_called).toBe(true)
    })
  })
})
