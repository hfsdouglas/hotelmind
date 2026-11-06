import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { reservasService } from '@/api/reservas.service'
import { DetalheReservaPage } from './[id]/index'
import { ReservasPage } from './index'

vi.mock('@/api/reservas.service', () => ({
  reservasService: {
    list: vi.fn(),
    get: vi.fn(),
    changeStatus: vi.fn(),
    salvarFichaHospede: vi.fn(),
    regenerarLinkFnrh: vi.fn(),
    desativarLinkFnrh: vi.fn(),
  },
}))

vi.mock('@/api/parceiros_comerciais.service', () => ({
  parceirosComerciaisService: {
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

describe('ReservasPages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(parceirosComerciaisService.list).mockResolvedValue({
      data: [],
      meta: { total: 0, pagina: 1, limite: 25, total_paginas: 0 },
    })
  })

  describe('ReservasPage (Listagem)', () => {
    it('renders reservation list page with filters and data', async () => {
      vi.mocked(reservasService.list).mockResolvedValue({
        data: [
          {
            id: 'res-1',
            hotel_id: 'h1',
            codigo: 'RES-001',
            titular_nome: 'Carlos Drummond',
            titular_telefone: '11988887777',
            titular_email: 'carlos@hotel.com',
            quarto_id: 'q1',
            regime_alimentacao_id: 'reg1',
            parceiro_comercial_id: null,
            check_in: '2026-12-01',
            check_out: '2026-12-05',
            quantidade_adultos: 2,
            quantidade_criancas: 0,
            valor_total: '1500.00',
            detalhamento_diarias: [],
            status: 'confirmada',
            token_fnrh_ativo: true,
            fnrh_enviada_em: null,
            fichas_preenchidas: 1,
            total_hospedes: 2,
            observacoes: null,
            quarto: {
              id: 'q1',
              identificacao: '101',
              categoria_nome: 'Deluxe',
            },
            regime_alimentacao: {
              id: 'reg1',
              titulo: 'Café da Manhã',
              cor_pulseira: '#f59e0b',
            },
            criado_em: '2026-11-01',
            atualizado_em: '2026-11-01',
          },
        ],
        meta: {
          total: 1,
          pagina: 1,
          limite: 25,
          total_paginas: 1,
        },
      })

      const queryClient = createQueryClient()

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/reservas']}>
            <Routes>
              <Route path="/reservas" element={<ReservasPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(screen.getByText('Gestão de Reservas')).toBeInTheDocument()
      expect(screen.getByText('Nova Reserva')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('RES-001')).toBeInTheDocument()
        expect(screen.getAllByText('Carlos Drummond').length).toBeGreaterThan(0)
        expect(screen.getByText('Suíte 101')).toBeInTheDocument()
        expect(screen.getByText(/1 de 2 preenchida\(s\)/i)).toBeInTheDocument()
      })
    })
  })

  describe('DetalheReservaPage', () => {
    it('renders reservation detail page with frozen daily rates and guest cards', async () => {
      vi.mocked(reservasService.get).mockResolvedValue({
        id: 'res-1',
        hotel_id: 'h1',
        codigo: 'RES-001',
        titular_nome: 'Carlos Drummond',
        titular_telefone: '11988887777',
        titular_email: 'carlos@hotel.com',
        quarto_id: 'q1',
        regime_alimentacao_id: 'reg1',
        parceiro_comercial_id: null,
        check_in: '2026-12-01',
        check_out: '2026-12-03',
        quantidade_adultos: 2,
        quantidade_criancas: 0,
        valor_total: '800.00',
        detalhamento_diarias: [
          {
            data: '2026-12-01',
            tarifario_id: 't1',
            tarifario_nome: 'Tarifa Padrão',
            valor_diaria: '400.00',
          },
          {
            data: '2026-12-02',
            tarifario_id: 't1',
            tarifario_nome: 'Tarifa Padrão',
            valor_diaria: '400.00',
          },
        ],
        status: 'a_confirmar',
        token_fnrh_ativo: true,
        fnrh_enviada_em: null,
        fichas_preenchidas: 0,
        total_hospedes: 2,
        observacoes: 'Chegada tarde',
        quarto: {
          id: 'q1',
          identificacao: '101',
          categoria_nome: 'Deluxe',
        },
        regime_alimentacao: {
          id: 'reg1',
          titulo: 'Café da Manhã',
          cor_pulseira: '#f59e0b',
        },
        hospedes: [
          {
            id: 'hosp-1',
            posicao: 1,
            ficha_status: 'pendente',
            preenchido_por: null,
            preenchido_em: null,
            nome_completo: 'Carlos Drummond',
            nacionalidade: 'Brasileira',
            data_nascimento: null,
            sexo: null,
            profissao: null,
            tipo_documento: null,
            numero_documento: null,
            logradouro: null,
            numero_endereco: null,
            complemento: null,
            bairro: null,
            cidade: null,
            estado: null,
            cep: null,
            pais_residencia: null,
            telefone: null,
            email: null,
            motivo_viagem: null,
            meio_transporte: null,
            responsavel_posicao: null,
          },
        ],
        criado_em: '2026-11-01',
        atualizado_em: '2026-11-01',
      })

      const queryClient = createQueryClient()

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/reservas/res-1']}>
            <Routes>
              <Route path="/reservas/:id" element={<DetalheReservaPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('RES-001')).toBeInTheDocument()
        expect(screen.getAllByText('Carlos Drummond').length).toBeGreaterThan(0)
        expect(
          screen.getByText('Tarifas Aplicadas por Diária')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Ficha Nacional de Hóspedes (FNRH)')
        ).toBeInTheDocument()
      })
    })
  })
})
