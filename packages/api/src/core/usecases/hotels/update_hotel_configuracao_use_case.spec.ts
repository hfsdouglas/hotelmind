import type { UpdateHotelConfiguracaoInput } from '@hotelmind/contracts'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryHotelConfiguracaoRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_configuracao_repository'
import { UpdateHotelConfiguracaoUseCase } from './update_hotel_configuracao_use_case'

let repository: InMemoryHotelConfiguracaoRepository
let sut: UpdateHotelConfiguracaoUseCase

const BASE_INPUT: UpdateHotelConfiguracaoInput = {
  hotel_name: 'Pousada Encantada',
  legal_name: 'Pousada Encantada LTDA',
  tax_id: '11222333000144',
  category: 'POUSADA',
  star_rating: 4,
  short_description: 'Sua pousada no campo',
  full_description: 'Descrição completa da pousada',
  logo_primary: 'data:image/png;base64,primary',
  logo_dark: 'data:image/png;base64,dark',
  favicon: 'data:image/x-icon;base64,fav',
  color_primary: '#2563eb',
  color_secondary: '#475569',
  color_background: '#f8fafc',
  color_surface: '#ffffff',
  color_text_primary: '#0f172a',
  color_text_secondary: '#334155',
  color_accent: '#eab308',
  free_child_age_limit: 6,
  free_child_max_per_room: 2,
  checkin_time: '14:00',
  checkout_time: '12:00',
  reception_24h: true,
  reception_opening_time: null,
  reception_closing_time: null,
  pet_friendly: true,
  pet_max_weight_kg: 10,
  smoking_allowed: false,
  smoking_sanitization_fee: 200,
  parking_type: 'GRATUITO',
  parking_fee_per_day: null,
  parking_reservation_required: false,
  parking_covered: 'COBERTO',
  wifi_available: true,
  wifi_type: 'GRATUITO_TOTAL',
  wifi_ssid_default: 'Pousada_WiFi',
  wifi_password_default: 'pousada123',
  wifi_show_on_voucher: true,
}

describe('UpdateHotelConfiguracaoUseCase', () => {
  beforeEach(() => {
    repository = new InMemoryHotelConfiguracaoRepository()
    sut = new UpdateHotelConfiguracaoUseCase(repository)

    repository.seedHotel({
      id: 'hotel-1',
      nome_hotel: 'Pousada Original',
      nome_fantasia: 'Pousada Original',
      razao_social: 'Pousada Original LTDA',
      cnpj: '11222333000144',
    })
  })

  it('updates configuration and institutional data successfully', async () => {
    const result = await sut.execute({
      hotelId: 'hotel-1',
      data: BASE_INPUT,
    })

    expect(result.hotel_id).toBe('hotel-1')
    expect(result.hotel_name).toBe('Pousada Encantada')
    expect(result.category).toBe('POUSADA')
    expect(result.color_primary).toBe('#2563eb')
    expect(result.free_child_age_limit).toBe(6)
    expect(result.wifi_ssid_default).toBe('Pousada_WiFi')
  })

  it('validates reception hours when reception_24h is false', async () => {
    await expect(
      sut.execute({
        hotelId: 'hotel-1',
        data: {
          ...BASE_INPUT,
          reception_24h: false,
          reception_opening_time: null,
          reception_closing_time: '22:00',
        },
      })
    ).rejects.toThrowError(/recepção/i)
  })

  it('throws an error if hotel does not exist', async () => {
    await expect(
      sut.execute({
        hotelId: 'non-existing',
        data: BASE_INPUT,
      })
    ).rejects.toThrowError(/hotel não encontrado/i)
  })
})
