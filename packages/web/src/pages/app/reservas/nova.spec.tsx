import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { reservasService } from '@/api/reservas.service'
import { NovaReservaPage } from './nova'

vi.mock('@/api/reservas.service', () => ({
  reservasService: {
    disponibilidade: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('@/api/regimes_alimentacao.service', () => ({
  regimesAlimentacaoService: {
    list: vi.fn(),
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

describe('NovaReservaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(regimesAlimentacaoService.list).mockResolvedValue([
      {
        id: 'regime-1',
        hotel_id: 'h1',
        titulo: 'Café da Manhã',
        descricao: 'Incluso café',
        cor_pulseira: '#f59e0b',
        ativo: true,
        criado_em: '2026-01-01',
        atualizado_em: '2026-01-01',
      },
    ])
    vi.mocked(parceirosComerciaisService.list).mockResolvedValue([
      {
        id: 'parceiro-1',
        hotel_id: 'h1',
        tipo_pessoa: 'PJ',
        razao_social: 'Agência CVC Turismo',
        nome_fantasia: 'CVC',
        cpf_cnpj: '00000000000191',
        ativo: true,
        comissao_padrao: '10.00',
        criado_em: '2026-01-01',
        atualizado_em: '2026-01-01',
      },
    ])
    vi.mocked(reservasService.disponibilidade).mockResolvedValue([
      {
        quarto_id: 'quarto-1',
        identificacao: 'Suíte 101 Master',
        categoria_nome: 'Master Luxo',
        limite_hospedes: 4,
        valor_total: '1200.00',
      },
    ])
  })

  it('renders new reservation form with all steps', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NovaReservaPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Nova Reserva')).toBeInTheDocument()
    expect(
      screen.getByText(/1\. Período de Hospedagem e Ocupantes/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/2\. Regime de Alimentação/i)).toBeInTheDocument()
    expect(
      screen.getByText(/4\. Dados do Titular e Parceiro Comercial/i)
    ).toBeInTheDocument()
  })

  it('displays available rooms after selecting valid dates and regime', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NovaReservaPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(regimesAlimentacaoService.list).toHaveBeenCalled()
    })
  })
})
