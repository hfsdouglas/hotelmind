import { describe, expect, it } from 'vitest'
import {
  HotelConfiguracao,
  type HotelConfiguracaoProps,
} from './hotel_configuracao'

const VALID_PROPS: HotelConfiguracaoProps = {
  id: 'cfg-1',
  hotel_id: 'hotel-1',
  categoria: 'HOTEL',
  classificacao_estrelas: 4,
  descricao_curta: 'Hotel aconchegante no centro da cidade',
  descricao_completa: 'Mais detalhes sobre o hotel...',
  logo_primary: 'data:image/png;base64,primary',
  logo_dark: 'data:image/png;base64,dark',
  favicon: 'data:image/x-icon;base64,fav',
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
  pet_friendly: true,
  pet_max_weight_kg: 15,
  smoking_allowed: false,
  smoking_sanitization_fee: 250,
  parking_type: 'PAGO_LOCAL',
  parking_fee_per_day: 35,
  parking_reservation_required: false,
  parking_covered: 'COBERTO',
  wifi_available: true,
  wifi_type: 'GRATUITO_TOTAL',
  wifi_ssid_default: 'Hotel_Guest',
  wifi_password_default: 'secret123',
  wifi_show_on_voucher: true,
}

describe('HotelConfiguracao Entity', () => {
  it('creates a valid HotelConfiguracao instance with all properties', () => {
    const config = HotelConfiguracao.create(VALID_PROPS)

    expect(config.id).toBe('cfg-1')
    expect(config.hotel_id).toBe('hotel-1')
    expect(config.categoria).toBe('HOTEL')
    expect(config.color_primary).toBe('#1e40af')
    expect(config.reception_24h).toBe(true)
    expect(config.wifi_ssid_default).toBe('Hotel_Guest')
  })

  it('validates HEX color formats and rejects invalid colors', () => {
    expect(() => {
      HotelConfiguracao.create({
        ...VALID_PROPS,
        color_primary: 'invalid-hex',
      })
    }).toThrowError(/cor primária inválida/i)

    expect(() => {
      HotelConfiguracao.create({
        ...VALID_PROPS,
        color_accent: '#1234567',
      })
    }).toThrowError(/cor de destaque inválida/i)
  })

  it('validates reception hours when reception_24h is false', () => {
    expect(() => {
      HotelConfiguracao.create({
        ...VALID_PROPS,
        reception_24h: false,
        reception_opening_time: null,
        reception_closing_time: '22:00',
      })
    }).toThrowError(/horários de funcionamento da recepção são obrigatórios/i)
  })

  it('allows valid reception hours when reception_24h is false', () => {
    const config = HotelConfiguracao.create({
      ...VALID_PROPS,
      reception_24h: false,
      reception_opening_time: '07:00',
      reception_closing_time: '22:00',
    })

    expect(config.reception_24h).toBe(false)
    expect(config.reception_opening_time).toBe('07:00')
    expect(config.reception_closing_time).toBe('22:00')
  })

  it('validates free_child_age_limit to not be negative', () => {
    expect(() => {
      HotelConfiguracao.create({
        ...VALID_PROPS,
        free_child_age_limit: -1,
      })
    }).toThrowError(/idade limite de gratuidade não pode ser negativa/i)
  })
})
