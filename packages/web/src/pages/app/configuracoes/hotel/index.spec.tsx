import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hotelConfiguracaoService } from '@/api/hotel_configuracao.service'
import { HotelConfiguracoesPage } from './index'

vi.mock('@/api/hotel_configuracao.service', () => ({
  hotelConfiguracaoService: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const MOCK_CONFIG = {
  id: 'hotel-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  nome_hotel: 'Pousada Sol & Mar SA',
  nome_fantasia: 'Pousada Sol & Mar',
  razao_social: 'Sol & Mar LTDA',
  cnpj: '12345678000199',
  email_comercial: 'contato@solemar.com.br',
  telefone_comercial: '1133334444',
  celular: '11988887777',
  website: 'https://solemar.com.br',
  categoria: 'POUSADA' as const,
  classificacao_estrelas: 4,
  descricao_curta: 'Pousada beira-mar',
  descricao_completa: 'Descrição completa da pousada',
  limite_idade_crianca_gratis: 5,
  quantidade_max_criancas_gratis: 1,
  horario_checkin: '14:00',
  horario_checkout: '12:00',
  recepcao_24h: true,
  horario_abertura_recepcao: null,
  horario_fechamento_recepcao: null,
  aceita_pets: true,
  peso_maximo_pet_kg: 10,
  permite_fumar: false,
  taxa_higienizacao_fumo: 300,
  tipo_estacionamento: 'GRATUITO' as const,
  valor_diaria_estacionamento: null,
  estacionamento_reserva_previa: false,
  cobertura_estacionamento: 'COBERTO' as const,
  possui_wifi: true,
  tipo_wifi: 'GRATUITO_TOTAL' as const,
  nome_rede_wifi: 'SolMar_WiFi',
  senha_rede_wifi: 'solmar123',
  exibir_wifi_voucher: true,
  tema: {
    id: 'tema-1',
    hotel_id: 'hotel-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    logo_principal: null,
    logo_escuro: null,
    favicon: null,
    cor_primaria: '#0284c7',
    cor_secundaria: '#64748b',
    cor_fundo: '#ffffff',
    cor_superficie: '#f8fafc',
    cor_texto_principal: '#0f172a',
    cor_texto_secundario: '#475569',
    cor_destaque: '#f59e0b',
  },
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('HotelConfiguracoesPage', { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state, then loads hotel configuration with CrudFormLayout', async () => {
    vi.mocked(hotelConfiguracaoService.get).mockResolvedValue(MOCK_CONFIG)
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HotelConfiguracoesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pousada Sol & Mar')).toBeInTheDocument()
    })

    // CrudFormLayout back button and title
    const backLink = screen.getByRole('link')
    expect(backLink).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('heading', { level: 1, name: /configurações do hotel/i })
    ).toBeInTheDocument()

    // 3 names
    expect(screen.getByLabelText(/nome corporativo/i)).toHaveValue(
      'Pousada Sol & Mar SA'
    )
    expect(screen.getByLabelText(/nome fantasia/i)).toHaveValue(
      'Pousada Sol & Mar'
    )
    expect(screen.getByLabelText(/razão social/i)).toHaveValue('Sol & Mar LTDA')

    // Save button in crud-form-actions
    const actionsRow = screen.getByTestId('crud-form-actions')
    expect(actionsRow).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^salvar$/i })
    ).toBeInTheDocument()
  })

  it('submits updated configuration and shows success toast', async () => {
    const user = userEvent.setup()
    vi.mocked(hotelConfiguracaoService.get).mockResolvedValue(MOCK_CONFIG)
    vi.mocked(hotelConfiguracaoService.update).mockResolvedValue({
      ...MOCK_CONFIG,
      nome_fantasia: 'Pousada Sol & Mar Renovada',
    })

    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HotelConfiguracoesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pousada Sol & Mar')).toBeInTheDocument()
    })

    const inputName = screen.getByLabelText(/nome fantasia/i)
    await user.clear(inputName)
    await user.type(inputName, 'Pousada Sol & Mar Renovada')

    const saveButton = screen.getByRole('button', {
      name: /^salvar$/i,
    })
    await user.click(saveButton)

    await waitFor(() => {
      expect(hotelConfiguracaoService.update).toHaveBeenCalled()
    })
  })
})
