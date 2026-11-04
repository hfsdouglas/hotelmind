import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
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
    </QueryClientProvider>
  )
}

describe('Tarifarios Pages (List, Create & Edit)', () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE_URL}/regimes_alimentacao`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'reg-1',
              hotel_id: 'h-1',
              titulo: 'Café da Manhã',
              descricao: 'Incluso café',
              cor_pulseira: '#2563EB',
              ativo: true,
              criado_em: '2026-11-03T00:00:00.000Z',
              atualizado_em: '2026-11-03T00:00:00.000Z',
            },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      )
    )
  })
  it('RF01 & US4: renders rate plan list with selected dates summary and opens the "Mais filtros" dropdown cleanly', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [
            { id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      ),
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [
            {
              id: 'tar-1',
              hotel_id: 'h-1',
              categoria_quarto_id: 'cat-1',
              regime_alimentacao_id: 'reg-1',
              nome: 'Baixa Temporada Março',
              datas: ['2027-03-01', '2027-03-15', '2027-03-31'],
              valor_diaria: '220.00',
              ativo: true,
              categoria_quarto: {
                id: 'cat-1',
                nome: 'Suítes Luxo',
                status: 'S',
              },
              regime_alimentacao: {
                id: 'reg-1',
                titulo: 'Café da Manhã',
                cor_pulseira: '#2563EB',
              },
              criado_em: '2026-11-02T12:00:00.000Z',
              atualizado_em: '2026-11-02T12:00:00.000Z',
            },
          ],
          meta: { pagina: 1, limite: 25, total: 1, ultima_pagina: 1 },
        })
      )
    )

    render_with_providers('/tarifarios')

    await waitFor(() => {
      expect(screen.getByText('Baixa Temporada Março')).toBeInTheDocument()
    })
    expect(screen.getByText('Regime de Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Café da Manhã')).toBeInTheDocument()
    expect(screen.getByText('3 dias tarifados')).toBeInTheDocument()
    expect(screen.getByText('R$ 220.00')).toBeInTheDocument()

    // Click "Mais filtros" button -> opens popover with Situação and Categoria de quarto filters
    const more_filters_btn = screen.getByTestId('more-filters-trigger')
    expect(more_filters_btn).toHaveTextContent('Mais filtros')
    expect(screen.queryByTestId('more-filters-content')).not.toBeInTheDocument()

    fireEvent.click(more_filters_btn)
    expect(screen.getByTestId('more-filters-content')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por situação')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por categoria')).toBeInTheDocument()
  })

  it('clears both categoria_quarto_id and ativo when clicking "Limpar filtros"', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [
            { id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      ),
      http.get(`${BASE_URL}/tarifarios`, () =>
        HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 25, total: 0, ultima_pagina: 1 },
        })
      )
    )

    render_with_providers('/tarifarios?categoria_quarto_id=cat-1&ativo=true')

    fireEvent.click(screen.getByTestId('more-filters-trigger'))
    const clear_btn = screen.getByTestId('clear-more-filters')
    expect(clear_btn).toBeInTheDocument()

    fireEvent.click(clear_btn)

    await waitFor(() => {
      expect(screen.queryByTestId('clear-more-filters')).not.toBeInTheDocument()
    })
  })

  it('US4: renders NovoTarifarioPage without breadcrumb navigation', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [
            { id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      ),
      http.get(`${BASE_URL}/tarifarios/calendario`, () =>
        HttpResponse.json({ data: [] })
      )
    )

    render_with_providers('/tarifarios/novo')

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Novo tarifário' })
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Regime de Alimentação' })
    ).toBeInTheDocument()
  })

  it('CA07, CA08 & US4: loads edit page without breadcrumbs or self-conflict and requires confirmation before deactivation', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [
            { id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      ),
      http.get(`${BASE_URL}/tarifarios/tar-1`, () =>
        HttpResponse.json({
          id: 'tar-1',
          hotel_id: 'h-1',
          categoria_quarto_id: 'cat-1',
          regime_alimentacao_id: 'reg-1',
          nome: 'Baixa Temporada Março',
          datas: ['2027-03-01', '2027-03-15'],
          valor_diaria: '220.00',
          ativo: true,
          categoria_quarto: { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' },
          regime_alimentacao: {
            id: 'reg-1',
            titulo: 'Café da Manhã',
            cor_pulseira: '#2563EB',
          },
          criado_em: '2026-11-02T12:00:00.000Z',
          atualizado_em: '2026-11-02T12:00:00.000Z',
        })
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
        })
      )
    )

    render_with_providers('/tarifarios/tar-1/editar')

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Baixa Temporada Março')
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('combobox', { name: 'Regime de Alimentação' })
    ).toBeInTheDocument()

    // Breadcrumb navigation is completely removed on Edit page as well
    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' })
    ).not.toBeInTheDocument()

    // Self period is excluded from conflict alert
    expect(
      screen.queryByTestId('period-conflict-alert')
    ).not.toBeInTheDocument()

    // Period summary shows only count without individual dates list
    expect(screen.getByTestId('period-summary-selected')).toHaveTextContent(
      '2 datas marcadas'
    )
    expect(screen.getByTestId('period-summary-selected')).not.toHaveTextContent(
      '01/03/2027'
    )

    // Old button "Desativar tarifário" and checkbox "Tarifário ativo" are removed
    expect(
      screen.queryByRole('button', { name: 'Desativar tarifário' })
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Tarifário ativo')).not.toBeInTheDocument()

    // Status field with Ativado/Desativado radio buttons is present
    const radio_ativado = screen.getByRole('radio', { name: 'Ativado' })
    const radio_desativado = screen.getByRole('radio', { name: 'Desativado' })
    expect(radio_ativado).toBeChecked()
    expect(radio_desativado).not.toBeChecked()

    // Selecting "Desativado" and saving opens the confirmation dialog
    fireEvent.click(radio_desativado)
    expect(radio_desativado).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByText('Desativar tarifário?')).toBeInTheDocument()
  })

  it('renders prompt to create a meal plan when no active meal plans exist on NovoTarifarioPage', async () => {
    server.use(
      http.get(`${BASE_URL}/categorias_quartos`, () =>
        HttpResponse.json({
          data: [
            { id: 'cat-1', hotel_id: 'h-1', nome: 'Suítes Luxo', status: 'S' },
          ],
          meta: { pagina: 1, limite: 250, total: 1, ultima_pagina: 1 },
        })
      ),
      http.get(`${BASE_URL}/regimes_alimentacao`, () =>
        HttpResponse.json({
          data: [],
          meta: { pagina: 1, limite: 250, total: 0, ultima_pagina: 1 },
        })
      )
    )

    render_with_providers('/tarifarios/novo')

    await waitFor(() => {
      expect(
        screen.getByText(
          'Nenhum regime de alimentação ativo foi cadastrado para o hotel.'
        )
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('link', { name: 'Criar regime de alimentação' })
    ).toHaveAttribute('href', '/regimes_alimentacao/novo')
  })
})
