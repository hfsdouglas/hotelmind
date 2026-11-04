import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { orcamentosService } from '@/api/orcamentos.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { tarifariosService } from '@/api/tarifarios.service'
import { EditarOrcamentoPage } from './[id]/editar'
import { OrcamentosPage } from './index'
import { NovoOrcamentoPage } from './novo'

vi.mock('@/api/orcamentos.service', () => ({
  orcamentosService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/api/regimes_alimentacao.service', () => ({
  regimesAlimentacaoService: {
    list: vi.fn(),
  },
}))

vi.mock('@/api/categorias_quartos.service', () => ({
  categoriasQuartosService: {
    list: vi.fn(),
  },
}))

vi.mock('@/api/tarifarios.service', () => ({
  tarifariosService: {
    list: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('Orcamentos Admin Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(regimesAlimentacaoService.list).mockResolvedValue({
      data: [
        {
          id: 'reg-1',
          hotel_id: 'hotel-1',
          titulo: 'Café da Manhã',
          descricao: 'Incluso',
          cor_pulseira: '#3B82F6',
          ativo: true,
          criado_em: '2026-01-01T00:00:00Z',
          atualizado_em: '2026-01-01T00:00:00Z',
        },
      ],
      meta: { total: 1, pagina: 1, limite: 10, ultima_pagina: 1 },
    })

    vi.mocked(categoriasQuartosService.list).mockResolvedValue({
      data: [
        {
          id: 'cat-1',
          hotel_id: 'hotel-1',
          nome: 'Suíte Luxo',
          status: 'S',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
      meta: { total: 1, pagina: 1, limite: 10, ultima_pagina: 1 },
    })

    vi.mocked(tarifariosService.list).mockResolvedValue({
      data: [],
      meta: { total: 0, pagina: 1, limite: 10, ultima_pagina: 1 },
    })
  })

  it('renders orcamentos list page with columns and action button', async () => {
    vi.mocked(orcamentosService.list).mockResolvedValue({
      data: [
        {
          id: 'orc-1',
          hotel_id: 'hotel-1',
          lead_id: 'lead-1',
          regime_alimentacao_id: 'reg-1',
          categoria_quarto_id: 'cat-1',
          check_in: '2026-12-01',
          check_out: '2026-12-03',
          quantidade_adultos: 2,
          quantidade_criancas: 0,
          quantidade_pets: 0,
          valor_total: '600.00',
          detalhamento_noites: [],
          token_publico: 'tok-123',
          status: 'pendente',
          lead: {
            id: 'lead-1',
            nome: 'Ana Carolina',
            telefone: '11988881111',
            email: 'ana@teste.com',
          },
          regime_alimentacao: {
            id: 'reg-1',
            titulo: 'Café da Manhã',
            cor_pulseira: '#3B82F6',
          },
          categoria_quarto: {
            id: 'cat-1',
            nome: 'Suíte Luxo',
          },
          criado_em: '2026-11-04T12:00:00Z',
          atualizado_em: '2026-11-04T12:00:00Z',
        },
      ],
      meta: { total: 1, pagina: 1, limite: 25, ultima_pagina: 1 },
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/orcamentos']}>
          <Routes>
            <Route path="/reservas/orcamentos" element={<OrcamentosPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Orçamentos de Reserva')).toBeInTheDocument()
      expect(screen.getByText('Novo Orçamento')).toBeInTheDocument()
      expect(screen.getByText('Ana Carolina')).toBeInTheDocument()
      expect(screen.getByText('Suíte Luxo')).toBeInTheDocument()
      expect(screen.getByText('Café da Manhã')).toBeInTheDocument()
      expect(screen.getByText('R$ 600,00')).toBeInTheDocument()
    })
  })

  it('renders novo orcamento form with sequential steps', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/orcamentos/novo']}>
          <Routes>
            <Route
              path="/reservas/orcamentos/novo"
              element={<NovoOrcamentoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Novo Orçamento')).toBeInTheDocument()
      expect(
        screen.getByText('Passo 1: Período e Hóspedes')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Passo 2: Regime de Alimentação')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Passo 3: Acomodação (Suítes Disponíveis pelo Tarifário)'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('Passo 4: Dados do Primeiro Contato (Lead)')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
      expect(screen.getByText('Data de Check-in *')).toBeInTheDocument()
      expect(screen.getByText('Data de Check-out *')).toBeInTheDocument()
      expect(screen.getByText('Cupom de Desconto')).toBeInTheDocument()
    })
  })

  it('renders editar orcamento form with populated values', async () => {
    vi.mocked(orcamentosService.get).mockResolvedValue({
      id: 'orc-1',
      hotel_id: 'hotel-1',
      lead_id: 'lead-1',
      regime_alimentacao_id: 'reg-1',
      categoria_quarto_id: 'cat-1',
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 2,
      quantidade_criancas: 1,
      quantidade_pets: 0,
      valor_total: '700.00',
      detalhamento_noites: [
        {
          data: '2026-12-01',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa A',
          valor_diaria: '350.00',
        },
        {
          data: '2026-12-02',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa A',
          valor_diaria: '350.00',
        },
      ],
      token_publico: 'tok-xyz',
      status: 'pendente',
      observacoes: 'Quarto andar alto',
      lead: {
        id: 'lead-1',
        nome: 'Marcos Paulo',
        telefone: '11911112222',
        email: 'marcos@teste.com',
      },
      regime_alimentacao: {
        id: 'reg-1',
        titulo: 'Café da Manhã',
        cor_pulseira: '#3B82F6',
      },
      categoria_quarto: {
        id: 'cat-1',
        nome: 'Suíte Luxo',
      },
      criado_em: '2026-11-04T12:00:00Z',
      atualizado_em: '2026-11-04T12:00:00Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/orcamentos/orc-1/editar']}>
          <Routes>
            <Route
              path="/reservas/orcamentos/:id/editar"
              element={<EditarOrcamentoPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Editar Orçamento - Marcos Paulo')
      ).toBeInTheDocument()
      expect(screen.getByText('Marcos Paulo')).toBeInTheDocument()
      expect(screen.getByText('R$ 700,00')).toBeInTheDocument()
      expect(screen.getByText('Copiar Link')).toBeInTheDocument()
      expect(screen.getByText('Enviar E-mail')).toBeInTheDocument()
      expect(screen.getByText('Enviar WhatsApp')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    })
  })
})
