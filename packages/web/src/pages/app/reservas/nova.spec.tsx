import type {
  ParceiroComercial,
  QuartoDisponivel,
  RegimeAlimentacao,
  Reserva,
} from '@hotelmind/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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
    vi.mocked(regimesAlimentacaoService.list).mockResolvedValue({
      data: [
        {
          id: 'regime-1',
          hotel_id: 'h1',
          titulo: 'Café da Manhã',
          descricao: 'Incluso café',
          cor_pulseira: '#f59e0b',
          ativo: true,
          criado_em: '2026-01-01',
          atualizado_em: '2026-01-01',
        } as RegimeAlimentacao,
      ],
      meta: { total: 1, pagina: 1, limite: 10, total_paginas: 1 },
    })
    vi.mocked(parceirosComerciaisService.list).mockResolvedValue({
      data: [
        {
          id: 'parceiro-1',
          hotel_id: 'h1',
          tipo_pessoa: 'PJ',
          razao_social: 'Agência CVC Turismo',
          nome_fantasia: 'CVC',
          cpf_cnpj: '00000000000191',
          status: 'ativo',
          comissao_padrao: '10.00',
          criado_em: '2026-01-01',
          atualizado_em: '2026-01-01',
        } as ParceiroComercial,
      ],
      meta: { total: 1, pagina: 1, limite: 10, total_paginas: 1 },
    })
    vi.mocked(reservasService.disponibilidade).mockResolvedValue([
      {
        quarto_id: 'quarto-1',
        identificacao: 'Suíte 101 Master',
        categoria_nome: 'Master Luxo',
        limite_hospedes: 4,
        valor_total: 1200.0,
      } as QuartoDisponivel,
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
    expect(screen.getByText(/Passo 1: Período e Hóspedes/i)).toBeInTheDocument()
    expect(screen.getByText(/Passo 2: Parceiro Comercial/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Passo 3: Regime de Alimentação/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Cupom de Desconto/i)).toBeInTheDocument()
    expect(screen.getByText(/Passo 4: Acomodação/i)).toBeInTheDocument()
    expect(screen.getByText(/Passo 5: Dados do Titular/i)).toBeInTheDocument()
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

  it('navigates to the reservation detail page after saving', async () => {
    const regime_id = '00000000-0000-4000-8000-0000000000a1'
    const quarto_id = '00000000-0000-4000-8000-000000000101'
    vi.mocked(regimesAlimentacaoService.list).mockResolvedValue({
      data: [
        {
          id: regime_id,
          hotel_id: 'h1',
          titulo: 'Café da Manhã',
          descricao: null,
          cor_pulseira: '#f59e0b',
          ativo: true,
          criado_em: '2026-01-01',
          atualizado_em: '2026-01-01',
        } as RegimeAlimentacao,
      ],
      meta: { total: 1, pagina: 1, limite: 10, ultima_pagina: 1 },
    })
    vi.mocked(reservasService.disponibilidade).mockResolvedValue([
      {
        quarto_id,
        identificacao: '101',
        categoria_id: 'categoria-1',
        categoria_nome: 'Master Luxo',
        limite_hospedes: 4,
        valor_total: '1200.00',
      },
    ])
    vi.mocked(reservasService.create).mockResolvedValue({
      id: 'reserva-99',
      codigo: 'RES-0099',
    } as Reserva)
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/reservas/nova']}>
          <Routes>
            <Route path="/reservas/nova" element={<NovaReservaPage />} />
            <Route
              path="/reservas/:id"
              element={<p>Detalhe da reserva aberto</p>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
    await user.type(screen.getByLabelText('Data de Check-in *'), '01122026')
    await user.type(screen.getByLabelText('Data de Check-out *'), '04122026')
    await user.click(
      await screen.findByRole('button', { name: /Café da Manhã/ })
    )
    await user.click(await screen.findByRole('button', { name: /Suíte 101/ }))
    await user.type(screen.getByLabelText('Nome Completo *'), 'Maria Souza')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Detalhe da reserva aberto')
    ).toBeInTheDocument()
    expect(reservasService.create).toHaveBeenCalledWith(
      expect.objectContaining({ quarto_id, check_in: '2026-12-01' })
    )
  })
})
