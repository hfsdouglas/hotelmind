import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reservasService } from '@/api/reservas.service'
import { FnrhPublicaPage } from './index'

vi.mock('@/api/reservas.service', () => ({
  reservasService: {
    getFnrhPublica: vi.fn(),
    salvarFichaPublica: vi.fn(),
    enviarFnrhAoHotel: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('FnrhPublicaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders public FNRH page with hotel summary and guest forms', async () => {
    vi.mocked(reservasService.getFnrhPublica).mockResolvedValue({
      hotel_nome: 'Hotel Fazenda das Palmeiras',
      titular_nome: 'Mariana Ximenes',
      check_in: '2026-12-10',
      check_out: '2026-12-15',
      quarto_identificacao: 'Suíte Presidencial 201',
      total_hospedes: 2,
      fnrh_enviada_em: null,
      hospedes: [
        {
          id: 'h1',
          posicao: 1,
          ficha_status: 'preenchida',
          preenchido_por: 'cliente',
          preenchido_em: '2026-11-04T10:00:00Z',
          nome_completo: 'Mariana Ximenes',
          nacionalidade: 'Brasileira',
          data_nascimento: '1985-04-26',
          sexo: 'F',
          profissao: 'Atriz',
          tipo_documento: 'cpf',
          numero_documento: '12345678909',
          logradouro: 'Av Atlantica',
          numero_endereco: '1000',
          complemento: 'Apto 101',
          bairro: 'Copacabana',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '22000000',
          pais_residencia: 'Brasil',
          telefone: '21988889999',
          email: 'mariana@example.com',
          motivo_viagem: 'Lazer / Férias',
          meio_transporte: 'Avião',
          procedencia: 'Rio de Janeiro - RJ',
          proximo_destino: 'São Paulo - SP',
          responsavel_posicao: null,
        },
        {
          id: 'h2',
          posicao: 2,
          ficha_status: 'pendente',
          preenchido_por: null,
          preenchido_em: null,
          nome_completo: null,
          nacionalidade: null,
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
          procedencia: null,
          proximo_destino: null,
          responsavel_posicao: null,
        },
      ],
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/fnrh/token-valido-123']}>
          <Routes>
            <Route path="/fnrh/:token" element={<FnrhPublicaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Hotel Fazenda das Palmeiras')
      ).toBeInTheDocument()
      expect(screen.getAllByText('Mariana Ximenes').length).toBeGreaterThan(0)
      expect(screen.getByText('Suíte Presidencial 201')).toBeInTheDocument()
      expect(screen.getByText('1/2 preenchida(s)')).toBeInTheDocument()
      expect(screen.getByText('Enviar ao Hotel')).toBeDisabled()
    })
  })

  it('displays error screen when token is invalid or expired', async () => {
    vi.mocked(reservasService.getFnrhPublica).mockRejectedValue(
      new Error('Token não encontrado')
    )

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/fnrh/token-invalido']}>
          <Routes>
            <Route path="/fnrh/:token" element={<FnrhPublicaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Ficha não disponível')).toBeInTheDocument()
      expect(
        screen.getByText(/Este link de ficha pode ter expirado/i)
      ).toBeInTheDocument()
    })
  })
})
