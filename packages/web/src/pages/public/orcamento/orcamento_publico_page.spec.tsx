import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orcamentosService } from '@/api/orcamentos.service'
import { VisualizarOrcamentoPublicoPage } from './index'

vi.mock('@/api/orcamentos.service', () => ({
  orcamentosService: {
    getPublico: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('VisualizarOrcamentoPublicoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders public budget details in mobile-first layout', async () => {
    vi.mocked(orcamentosService.getPublico).mockResolvedValue({
      token_publico: 'tok-abc',
      hotel_nome: 'Hotel Fazenda Paraíso',
      hotel_telefone: '11999998888',
      check_in: '2026-12-20',
      check_out: '2026-12-22',
      total_noites: 2,
      quantidade_adultos: 2,
      quantidade_criancas: 1,
      quantidade_pets: 1,
      regime_alimentacao: {
        nome: 'Pensão Completa',
        cor: '#10B981',
        descricao: 'Café, almoço e jantar inclusos',
      },
      categoria_quarto: {
        nome: 'Chalé Família',
      },
      lead_nome: 'Renata Vasconcellos',
      detalhamento_noites: [
        {
          data: '2026-12-20',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa Fim de Ano',
          valor_diaria: '500.00',
        },
        {
          data: '2026-12-21',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa Fim de Ano',
          valor_diaria: '500.00',
        },
      ],
      valor_total: '1000.00',
      status: 'pendente',
      criado_em: '2026-11-04T12:00:00Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orcamento/tok-abc']}>
          <Routes>
            <Route
              path="/orcamento/:token"
              element={<VisualizarOrcamentoPublicoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Olá, Renata Vasconcellos!')).toBeInTheDocument()
      expect(screen.getByText('Hotel Fazenda Paraíso')).toBeInTheDocument()
      expect(screen.getByText('Chalé Família')).toBeInTheDocument()
      expect(screen.getByText('Pensão Completa')).toBeInTheDocument()
      expect(screen.getByText('2 Adultos')).toBeInTheDocument()
      expect(screen.getByText('1 Criança')).toBeInTheDocument()
      expect(screen.getByText('1 Pet')).toBeInTheDocument()
      expect(screen.getAllByText('R$ 1.000,00').length).toBeGreaterThan(0)
    })
  })

  it('opens modal when lead clicks on Reservar Agora button', async () => {
    vi.mocked(orcamentosService.getPublico).mockResolvedValue({
      token_publico: 'tok-abc',
      hotel_nome: 'Hotel Fazenda Paraíso',
      hotel_telefone: '11999998888',
      check_in: '2026-12-20',
      check_out: '2026-12-22',
      total_noites: 2,
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      regime_alimentacao: {
        nome: 'Café da Manhã',
        cor: '#3B82F6',
      },
      categoria_quarto: {
        nome: 'Standard',
      },
      lead_nome: 'Lucas',
      detalhamento_noites: [],
      valor_total: '500.00',
      status: 'pendente',
      criado_em: '2026-11-04T12:00:00Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orcamento/tok-abc']}>
          <Routes>
            <Route
              path="/orcamento/:token"
              element={<VisualizarOrcamentoPublicoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Reservar Agora')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Reservar Agora'))

    await waitFor(() => {
      expect(screen.getByText('Reserva Direta em Breve!')).toBeInTheDocument()
      expect(screen.getByText('Falar no WhatsApp')).toBeInTheDocument()
    })
  })
})
