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
  id: 'cfg-1',
  hotel_id: 'hotel-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  hotel_name: 'Pousada Sol & Mar',
  legal_name: 'Sol & Mar LTDA',
  tax_id: '12345678000199',
  category: 'POUSADA' as const,
  star_rating: 4,
  short_description: 'Pousada beira-mar',
  full_description: 'Descrição completa da pousada',
  logo_primary: null,
  logo_dark: null,
  favicon: null,
  color_primary: '#0284c7',
  color_secondary: '#64748b',
  color_background: '#ffffff',
  color_surface: '#f8fafc',
  color_text_primary: '#0f172a',
  color_text_secondary: '#475569',
  color_accent: '#f59e0b',
  free_child_age_limit: 5,
  free_child_max_per_room: 1,
  checkin_time: '14:00',
  checkout_time: '12:00',
  reception_24h: true,
  reception_opening_time: null,
  reception_closing_time: null,
  pet_friendly: true,
  pet_max_weight_kg: 10,
  smoking_allowed: false,
  smoking_sanitization_fee: 300,
  parking_type: 'GRATUITO' as const,
  parking_fee_per_day: null,
  parking_reservation_required: false,
  parking_covered: 'COBERTO' as const,
  wifi_available: true,
  wifi_type: 'GRATUITO_TOTAL' as const,
  wifi_ssid_default: 'SolMar_WiFi',
  wifi_password_default: 'solmar123',
  wifi_show_on_voucher: true,
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

describe('HotelConfiguracoesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state, then loads hotel configuration', async () => {
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

    expect(screen.getByText('Configurações do Hotel')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /identidade visual & tema/i })
    ).toBeInTheDocument()
  })

  it('submits updated configuration and shows success toast', async () => {
    const user = userEvent.setup()
    vi.mocked(hotelConfiguracaoService.get).mockResolvedValue(MOCK_CONFIG)
    vi.mocked(hotelConfiguracaoService.update).mockResolvedValue({
      ...MOCK_CONFIG,
      hotel_name: 'Pousada Sol & Mar Renovada',
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
      name: /salvar alterações/i,
    })
    await user.click(saveButton)

    await waitFor(() => {
      expect(hotelConfiguracaoService.update).toHaveBeenCalled()
    })
  })
})
