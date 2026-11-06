import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reservasService } from '@/api/reservas.service'
import { EditarReservaPage } from './[id]/editar'
import { DetalheReservaPage } from './[id]/index'

vi.mock('@/api/reservas.service', () => ({
  reservasService: {
    get: vi.fn(),
    changeStatus: vi.fn(),
    salvarFichaHospede: vi.fn(),
    regenerarLinkFnrh: vi.fn(),
    desativarLinkFnrh: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('EdicaoHospedes & Transição de Status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(reservasService.get).mockResolvedValue({
      id: 'res-42',
      hotel_id: 'h1',
      codigo: 'RES-042',
      titular_nome: 'Fernanda Montenegro',
      titular_telefone: '21999990000',
      titular_email: 'fernanda@globo.com',
      quarto_id: 'q1',
      regime_alimentacao_id: 'reg1',
      parceiro_comercial_id: null,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '900.00',
      detalhamento_diarias: [
        {
          data: '2026-12-01',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa Feriado',
          valor_diaria: '450.00',
        },
        {
          data: '2026-12-02',
          tarifario_id: 't1',
          tarifario_nome: 'Tarifa Feriado',
          valor_diaria: '450.00',
        },
      ],
      status: 'a_confirmar',
      token_fnrh_ativo: true,
      fnrh_enviada_em: null,
      fichas_preenchidas: 0,
      total_hospedes: 1,
      observacoes: null,
      quarto: {
        id: 'q1',
        identificacao: '302',
        categoria_nome: 'Luxo Especial',
      },
      regime_alimentacao: {
        id: 'reg1',
        titulo: 'Pensão Completa',
        cor_pulseira: '#10b981',
      },
      hospedes: [
        {
          id: 'hosp-1',
          posicao: 1,
          ficha_status: 'pendente',
          preenchido_por: null,
          preenchido_em: null,
          nome_completo: 'Fernanda Montenegro',
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
  })

  it('opens guest edit dialog when clicking Editar Ficha', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/res-42']}>
          <Routes>
            <Route path="/reservas/:id" element={<DetalheReservaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Ficha')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Editar Ficha'))

    await waitFor(() => {
      expect(
        screen.getByText(
          /Preencha ou atualize as informações cadastrais exigidas pela Ficha Nacional/i
        )
      ).toBeInTheDocument()
    })
  })

  it('displays edit reservation button in preview without modifying status in preview', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/res-42']}>
          <Routes>
            <Route path="/reservas/:id" element={<DetalheReservaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Reserva')).toBeInTheDocument()
      expect(screen.queryByText('Confirmar Reserva')).not.toBeInTheDocument()
    })
  })

  it('renders edit reservation form with status transition selector', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservas/res-42/editar']}>
          <Routes>
            <Route
              path="/reservas/:id/editar"
              element={<EditarReservaPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Editar Reserva/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Situação \/ Status da Reserva/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Passo 1: Período e Hóspedes/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Passo 2: Parceiro Comercial/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Passo 3: Regime de Alimentação/i)
      ).toBeInTheDocument()
    })
  })
})
