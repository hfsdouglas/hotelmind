import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryHotelConfiguracaoRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_configuracao_repository'
import { GetHotelConfiguracaoUseCase } from './get_hotel_configuracao_use_case'

let repository: InMemoryHotelConfiguracaoRepository
let sut: GetHotelConfiguracaoUseCase

describe('GetHotelConfiguracaoUseCase', () => {
  beforeEach(() => {
    repository = new InMemoryHotelConfiguracaoRepository()
    sut = new GetHotelConfiguracaoUseCase(repository)

    repository.seedHotel({
      id: 'hotel-1',
      nome_hotel: 'Hotel Grand Luxo',
      nome_fantasia: 'Grand Luxo',
      razao_social: 'Grand Luxo Hotelaria LTDA',
      cnpj: '12345678000199',
    })
  })

  it('returns default settings when hotel has no persisted configuration', async () => {
    const result = await sut.execute({ hotelId: 'hotel-1' })

    expect(result.hotel_id).toBe('hotel-1')
    expect(result.hotel_name).toBe('Grand Luxo')
    expect(result.legal_name).toBe('Grand Luxo Hotelaria LTDA')
    expect(result.tax_id).toBe('12345678000199')
    expect(result.category).toBe('HOTEL')
    expect(result.color_primary).toBe('#1e40af')
    expect(result.checkin_time).toBe('14:00')
    expect(result.checkout_time).toBe('12:00')
    expect(result.reception_24h).toBe(true)
    expect(result.free_child_age_limit).toBe(5)
  })

  it('returns persisted configuration when available', async () => {
    await repository.upsert('hotel-1', {
      hotel_name: 'Grand Luxo Modificado',
      legal_name: 'Grand Luxo Razao',
      tax_id: '99999999000100',
      category: 'RESORT',
      star_rating: 5,
      short_description: 'Resort de luxo',
      full_description: 'Descrição completa',
      logo_primary: null,
      logo_dark: null,
      favicon: null,
      color_primary: '#0055ff',
      color_secondary: '#555555',
      color_background: '#f0f0f0',
      color_surface: '#ffffff',
      color_text_primary: '#111111',
      color_text_secondary: '#444444',
      color_accent: '#ffaa00',
      free_child_age_limit: 7,
      free_child_max_per_room: 2,
      checkin_time: '15:00',
      checkout_time: '11:00',
      reception_24h: false,
      reception_opening_time: '08:00',
      reception_closing_time: '23:00',
      pet_friendly: true,
      pet_max_weight_kg: 20,
      smoking_allowed: false,
      smoking_sanitization_fee: 300,
      parking_type: 'GRATUITO',
      parking_fee_per_day: null,
      parking_reservation_required: true,
      parking_covered: 'COBERTO',
      wifi_available: true,
      wifi_type: 'GRATUITO_TOTAL',
      wifi_ssid_default: 'Grand_Resort',
      wifi_password_default: 'wifi_pass',
      wifi_show_on_voucher: true,
    })

    const result = await sut.execute({ hotelId: 'hotel-1' })

    expect(result.hotel_name).toBe('Grand Luxo Modificado')
    expect(result.category).toBe('RESORT')
    expect(result.star_rating).toBe(5)
    expect(result.color_primary).toBe('#0055ff')
    expect(result.checkin_time).toBe('15:00')
    expect(result.reception_24h).toBe(false)
    expect(result.reception_opening_time).toBe('08:00')
  })

  it('throws an error if hotel does not exist', async () => {
    await expect(sut.execute({ hotelId: 'non-existing' })).rejects.toThrowError(
      /hotel não encontrado/i
    )
  })
})
