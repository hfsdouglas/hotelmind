import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HotelConfiguracaoForm } from './hotel_configuracao_form'

const MOCK_INITIAL_DATA: HotelConfiguracaoDTO = {
  id: 'cfg-1',
  hotel_id: 'hotel-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  hotel_name: 'Hotel Central',
  legal_name: 'Hotel Central LTDA',
  tax_id: '12345678000190',
  category: 'HOTEL',
  star_rating: 3,
  short_description: 'Central e aconchegante',
  full_description: 'Descrição completa',
  logo_primary: null,
  logo_dark: null,
  favicon: null,
  color_primary: '#1e40af',
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
  pet_friendly: false,
  pet_max_weight_kg: null,
  smoking_allowed: false,
  smoking_sanitization_fee: 200,
  parking_type: 'NAO_POSSUI',
  parking_fee_per_day: null,
  parking_reservation_required: false,
  parking_covered: 'DESCOBERTO',
  wifi_available: true,
  wifi_type: 'GRATUITO_TOTAL',
  wifi_ssid_default: 'WiFi_Hotel',
  wifi_password_default: 'senha123',
  wifi_show_on_voucher: true,
}

describe('HotelConfiguracaoForm', () => {
  it('renders all 5 tab triggers and the fixed action bar', () => {
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    expect(
      screen.getByRole('tab', { name: /identidade visual/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /crianças & hóspedes/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /horários & operação/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /regras da casa & pets/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /estacionamento & wi-fi/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /descartar alterações/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /salvar alterações/i })
    ).toBeInTheDocument()
  })

  it('switches tabs and preserves edited state across tabs', async () => {
    const user = userEvent.setup()
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    // Edit in tab 1
    const nameInput = screen.getByLabelText(/nome fantasia/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Hotel Central Editado')

    // Navigate to tab 2
    const tab2 = screen.getByRole('tab', { name: /crianças & hóspedes/i })
    await user.click(tab2)
    expect(
      screen.getByLabelText(/idade máxima para gratuidade/i)
    ).toBeInTheDocument()

    // Navigate back to tab 1
    const tab1 = screen.getByRole('tab', { name: /identidade visual/i })
    await user.click(tab1)

    // Confirm state was preserved
    expect(screen.getByLabelText(/nome fantasia/i)).toHaveValue(
      'Hotel Central Editado'
    )
  })

  it('discards modifications when clicking "Descartar alterações"', async () => {
    const user = userEvent.setup()
    render(
      <HotelConfiguracaoForm
        initialData={MOCK_INITIAL_DATA}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    const nameInput = screen.getByLabelText(/nome fantasia/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Modificado Temporário')
    expect(nameInput).toHaveValue('Modificado Temporário')

    const discardBtn = screen.getByRole('button', {
      name: /descartar alterações/i,
    })
    await user.click(discardBtn)

    expect(nameInput).toHaveValue('Hotel Central')
  })
})
