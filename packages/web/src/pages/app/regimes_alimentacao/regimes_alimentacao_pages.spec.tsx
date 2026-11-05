import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { EditarRegimeAlimentacaoPage } from './[id]/editar'
import { RegimesAlimentacaoPage } from './index'
import { NovoRegimeAlimentacaoPage } from './novo'

vi.mock('@/api/regimes_alimentacao.service', () => ({
  regimesAlimentacaoService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    ativar: vi.fn(),
    desativar: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('Regimes de Alimentação Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list page with title, wristband colors and action button', async () => {
    vi.mocked(regimesAlimentacaoService.list).mockResolvedValue({
      data: [
        {
          id: 'reg-1',
          hotel_id: 'hotel-1',
          titulo: 'All Inclusive VIP',
          descricao: 'Comida e bebida à vontade o dia todo',
          cor_pulseira: '#7C3AED',
          ativo: true,
          criado_em: '2026-01-01T00:00:00.000Z',
          atualizado_em: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: {
        total: 1,
        pagina: 1,
        limite: 25,
        ultima_pagina: 1,
      },
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/regimes_alimentacao']}>
          <Routes>
            <Route
              path="/regimes_alimentacao"
              element={<RegimesAlimentacaoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Regimes de Alimentação' })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /Novo regime/i })
    ).toBeInTheDocument()

    expect(await screen.findByText('All Inclusive VIP')).toBeInTheDocument()
    expect(screen.getByText('#7C3AED')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()

    // Abre popover de mais filtros
    const moreFiltersBtn = screen.getByTestId('more-filters-trigger')
    expect(moreFiltersBtn).toBeInTheDocument()
    fireEvent.click(moreFiltersBtn)

    expect(screen.getByTestId('more-filters-content')).toBeInTheDocument()
    expect(screen.getByLabelText(/Filtrar por status/i)).toBeInTheDocument()
  })

  it('renders novo regime page with form fields including textarea and color picker', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/regimes_alimentacao/novo']}>
          <Routes>
            <Route
              path="/regimes_alimentacao/novo"
              element={<NovoRegimeAlimentacaoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Novo regime de Alimentação' })
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/Título \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
    expect(screen.getByTestId('wristband-preview')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^ativado$/i })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /^desativado$/i })
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument()
  })

  it('submits novo regime form with selected fields', async () => {
    vi.mocked(regimesAlimentacaoService.create).mockResolvedValue({
      id: 'reg-new',
      hotel_id: 'hotel-1',
      titulo: 'Pensão Completa',
      descricao: 'Café, almoço e jantar',
      cor_pulseira: '#16A34A',
      ativo: true,
      criado_em: '2026-01-01T00:00:00.000Z',
      atualizado_em: '2026-01-01T00:00:00.000Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/regimes_alimentacao/novo']}>
          <Routes>
            <Route
              path="/regimes_alimentacao/novo"
              element={<NovoRegimeAlimentacaoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText(/Título \*/i), {
      target: { value: 'Pensão Completa' },
    })

    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: 'Café, almoço e jantar' },
    })

    // Selecionar cor verde no preset
    const greenPreset = screen.getByRole('button', {
      name: /Escolher cor Verde/i,
    })
    fireEvent.click(greenPreset)

    const submitBtn = screen.getByRole('button', { name: /Salvar/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(regimesAlimentacaoService.create).toHaveBeenCalledWith({
        titulo: 'Pensão Completa',
        descricao: 'Café, almoço e jantar',
        cor_pulseira: '#16A34A',
        ativo: true,
      })
    })
  })

  it('loads and displays existing regime on editar page', async () => {
    vi.mocked(regimesAlimentacaoService.get).mockResolvedValue({
      id: 'reg-123',
      hotel_id: 'hotel-1',
      titulo: 'Café da Manhã Exclusivo',
      descricao: 'Apenas café das 07:00 às 11:00',
      cor_pulseira: '#DC2626',
      ativo: true,
      criado_em: '2026-01-01T00:00:00.000Z',
      atualizado_em: '2026-01-01T00:00:00.000Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/regimes_alimentacao/reg-123/editar']}>
          <Routes>
            <Route
              path="/regimes_alimentacao/:id/editar"
              element={<EditarRegimeAlimentacaoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByDisplayValue('Café da Manhã Exclusivo')
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Apenas café das 07:00 às 11:00')
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('#DC2626')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^ativado$/i })).toBeChecked()

    // Alterna para Desativado
    fireEvent.click(screen.getByRole('radio', { name: /^desativado$/i }))
    expect(screen.getByRole('radio', { name: /^desativado$/i })).toBeChecked()
  })
})
