import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { EditarParceiroPage } from './[id]/editar'
import { ParceirosComerciaisPage } from './index'
import { NovoParceiroPage } from './novo'

vi.mock('@/api/parceiros_comerciais.service', () => ({
  parceirosComerciaisService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('Parceiros Comerciais Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a listagem de parceiros comerciais com colunas e dados', async () => {
    vi.mocked(parceirosComerciaisService.list).mockResolvedValue({
      data: [
        {
          id: 'p-1',
          hotel_id: 'hotel-1',
          tipo_parceiro: 'agencia_viagens',
          tipo_pessoa: 'PJ',
          razao_social: 'Viagens Estrela Dourada Ltda',
          nome_fantasia: 'Estrela Turismo',
          documento: '11222333000181',
          inscricao_estadual: null,
          estrangeiro: false,
          cadastur: '19.001.002/0001-99',
          codigo_iata: '99-8 1234 5',
          registro_embratur: null,
          logradouro: 'Av Paulista',
          numero: '1000',
          complemento: 'Sala 10',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          pais: 'Brasil',
          modelo_tarifario: 'comissionada',
          comissao_padrao: '12.00',
          politica_faturamento: 'faturado',
          prazo_pagamento_dias: 15,
          limite_credito: '50000.00',
          allotment_quartos: 5,
          status: 'ativo',
          motivo_bloqueio: null,
          observacoes: 'Acordo corporativo anual',
          criado_em: '2026-01-01T00:00:00.000Z',
          atualizado_em: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: {
        total: 1,
        pagina: 1,
        limite: 15,
        ultima_pagina: 1,
      },
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/comercial/parceiros']}>
          <Routes>
            <Route
              path="/comercial/parceiros"
              element={<ParceirosComerciaisPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Parceiros Comerciais')).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.getByText('Viagens Estrela Dourada Ltda')
      ).toBeInTheDocument()
      expect(screen.getByText('Estrela Turismo')).toBeInTheDocument()
      expect(screen.getByText('Agência de Viagens')).toBeInTheDocument()
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  it('deve submeter o formulário de novo parceiro', async () => {
    vi.mocked(parceirosComerciaisService.create).mockResolvedValue({
      id: 'p-new',
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agente_autonomo',
      tipo_pessoa: 'PF',
      razao_social: 'Mariana Consultora',
      nome_fantasia: null,
      documento: '52998224725',
      inscricao_estadual: null,
      estrangeiro: false,
      cadastur: null,
      codigo_iata: null,
      registro_embratur: null,
      logradouro: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
      pais: 'Brasil',
      modelo_tarifario: 'comissionada',
      comissao_padrao: '10.00',
      politica_faturamento: 'prepago',
      prazo_pagamento_dias: 0,
      limite_credito: '0.00',
      allotment_quartos: 0,
      status: 'ativo',
      motivo_bloqueio: null,
      observacoes: null,
      criado_em: '2026-01-01T00:00:00.000Z',
      atualizado_em: '2026-01-01T00:00:00.000Z',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/comercial/parceiros/novo']}>
          <Routes>
            <Route
              path="/comercial/parceiros/novo"
              element={<NovoParceiroPage />}
            />
            <Route
              path="/comercial/parceiros"
              element={<div>Lista Parceiros</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Novo Parceiro Comercial')).toBeInTheDocument()

    // Preenche Razão Social e Documento
    const razaoInput = screen.getByLabelText(/Razão Social/i)
    fireEvent.change(razaoInput, {
      target: { value: 'Agência Cruzeiro do Sul Ltda' },
    })

    const docInput = screen.getByLabelText(/^CNPJ/i)
    fireEvent.change(docInput, {
      target: { value: '11222333000181' },
    })

    const submitBtn = screen.getByRole('button', { name: /Salvar Parceiro/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(parceirosComerciaisService.create).toHaveBeenCalled()
    })
  })

  it('deve carregar dados existentes na tela de edição', async () => {
    vi.mocked(parceirosComerciaisService.get).mockResolvedValue({
      id: 'p-1',
      hotel_id: 'hotel-1',
      tipo_parceiro: 'clube_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Clube de Férias Brasil',
      nome_fantasia: 'Férias Club',
      documento: '11222333000181',
      inscricao_estadual: null,
      estrangeiro: false,
      cadastur: '19.001.002/0001-99',
      codigo_iata: null,
      registro_embratur: null,
      logradouro: 'Rua Central',
      numero: '100',
      complemento: null,
      bairro: 'Centro',
      cidade: 'Fortaleza',
      estado: 'CE',
      cep: '60000-000',
      pais: 'Brasil',
      modelo_tarifario: 'net',
      comissao_padrao: '0.00',
      politica_faturamento: 'voucher',
      prazo_pagamento_dias: 30,
      limite_credito: '100000.00',
      allotment_quartos: 10,
      status: 'ativo',
      motivo_bloqueio: null,
      observacoes: null,
      criado_em: '2026-01-01T00:00:00.000Z',
      atualizado_em: '2026-01-01T00:00:00.000Z',
      contatos: [],
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/comercial/parceiros/p-1/editar']}>
          <Routes>
            <Route
              path="/comercial/parceiros/:id/editar"
              element={<EditarParceiroPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Parceiro Comercial')).toBeInTheDocument()
      expect(
        screen.getByDisplayValue('Clube de Férias Brasil')
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('Férias Club')).toBeInTheDocument()
    })
  })
})
