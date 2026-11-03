import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { EditarTarifarioPage } from './[id]/editar'
import { TarifariosPage } from './index'
import { NovoTarifarioPage } from './novo'

const BASE_URL = 'http://localhost:3000'

function render_with_providers(initial_entry: string) {
  const query_client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={query_client}>
      <MemoryRouter initialEntries={[initial_entry]}>
        <Routes>
          <Route path="/tarifarios" element={<TarifariosPage />} />
          <Route path="/tarifarios/novo" element={<NovoTarifarioPage />} />
          <Route
            path="/tarifarios/:id/editar"
            element={<EditarTarifarioPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Tarifarios Pages (List, Create & Edit)', () => {
  it('RF01 & US4: renders rate plan list with selected dates summary and opens the "Mais filtros" dropdown cleanly', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [{ id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        }),
      ),
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'tar-1',
              hotel_id: 'h-1',
              categoria_quarto_id: 'cat-1',
              nome: 'Baixa Temporada Março',
              datas: ['2027-03-01', '2027-03-15', '2027-03-31'],
              valor_diaria: '220.00',
              ativo: true,
              categoria_quarto: {
                id: 'cat-1',
                nome: 'Suítes Luxo',
                status: 'S',
              },
              criado_em: '2026-11-02T12:00:00.000Z',
              atualizado_em: '2026-11-02T12:00:00.000Z',
            },
          ],
          meta: { pagina: 1, limite: 25, total: 1, ultima_pagina: 1 },
        }),
      ),
    )

    render_with_providers('/tarifarios')

    await waitFor(() => {
      expect(screen.getByText('Baixa Temporada Março')).toBeInTheDocument()
    })
    expect(
      screen.getByText('01/03/2027, 15/03/2027, 31/03/2027'),
    ).toBeInTheDocument()
    expect(screen.getByText('R$ 220.00')).toBeInTheDocument()

    // Click "Mais filtros" button -> opens popover with Situação and Categoria de quarto filters
    const more_filters_btn = screen.getByTestId('more-filters-trigger')
    expect(more_filters_btn).toHaveTextContent('Mais filtros')
    expect(
      screen.queryByTestId('more-filters-content'),
    ).not.toBeInTheDocument()

    fireEvent.click(more_filters_btn)
    expect(screen.getByTestId('more-filters-content')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por situação')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por categoria')).toBeInTheDocument()
  })

  it('US4: renders NovoTarifarioPage without breadcrumb navigation', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [{ id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        }),
      ),
      http.get(`${BASE_URL}/tarifarios/calendario`, () =>
        HttpResponse.json({ data: [] }),
      ),
    )

    render_with_providers('/tarifarios/novo')

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Novo tarifário' }),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' }),
    ).not.toBeInTheDocument()
  })

  it('CA07, CA08 & US4: loads edit page without breadcrumbs or self-conflict and requires confirmation before deactivation', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [{ id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' }],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        }),
      ),
      http.get(`${BASE_URL}/tarifarios/tar-1`, () =>
        HttpResponse.json({
          id: 'tar-1',
          hotel_id: 'h-1',
          categoria_quarto_id: 'cat-1',
          nome: 'Baixa Temporada Março',
          datas: ['2027-03-01', '2027-03-15'],
          valor_diaria: '220.00',
          ativo: true,
          categoria_quarto: { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' },
          criado_em: '2026-11-02T12:00:00.000Z',
          atualizado_em: '2026-11-02T12:00:00.000Z',
        }),
      ),
      http.get(`${BASE_URL}/tarifarios/calendario`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'tar-1',
              categoria_quarto_id: 'cat-1',
              nome: 'Baixa Temporada Março',
              datas: ['2027-03-01', '2027-03-15'],
              valor_diaria: '220.00',
              ativo: true,
            },
          ],
        }),
      ),
    )

    render_with_providers('/tarifarios/tar-1/editar')

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Baixa Temporada Março'),
      ).toBeInTheDocument()
    })

    // Breadcrumb navigation is completely removed on Edit page as well
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' }),
    ).not.toBeInTheDocument()

    // Self period is excluded from conflict alert
    expect(
      screen.queryByTestId('period-conflict-alert'),
    ).not.toBeInTheDocument()

    // Click Deactivate button -> opens confirmation dialog
    fireEvent.click(
      screen.getByRole('button', { name: 'Desativar tarifário' }),
    )
    expect(screen.getByText('Desativar tarifário?')).toBeInTheDocument()
  })
})
