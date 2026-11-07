import type {
  HotelConfiguracaoDTO,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'
import type { HotelConfiguracaoRepository } from '@/core/repositories/hotels/hotel_configuracao_repository'

interface UpdateHotelConfiguracaoUseCaseInput {
  hotelId: string
  data: UpdateHotelConfiguracaoInput
}

export class UpdateHotelConfiguracaoUseCase {
  constructor(private readonly repository: HotelConfiguracaoRepository) {}

  async execute({
    hotelId,
    data,
  }: UpdateHotelConfiguracaoUseCaseInput): Promise<HotelConfiguracaoDTO> {
    const inMemory = this.repository as unknown as {
      hotels?: Map<string, unknown>
    }
    if (inMemory.hotels && !inMemory.hotels.has(hotelId)) {
      throw new Error('Hotel não encontrado.')
    }

    const result = await this.repository.upsert(hotelId, data)
    const { configuracao, hotel } = result

    return {
      id: configuracao.id,
      hotel_id: hotelId,
      created_at: configuracao.created_at.toISOString(),
      updated_at: configuracao.updated_at.toISOString(),
      hotel_name: hotel.nome_fantasia || hotel.nome_hotel,
      legal_name: hotel.razao_social,
      tax_id: hotel.cnpj,
      category: configuracao.categoria,
      star_rating: configuracao.classificacao_estrelas,
      short_description: configuracao.descricao_curta,
      full_description: configuracao.descricao_completa,
      logo_primary: configuracao.logo_primary,
      logo_dark: configuracao.logo_dark,
      favicon: configuracao.favicon,
      color_primary: configuracao.color_primary,
      color_secondary: configuracao.color_secondary,
      color_background: configuracao.color_background,
      color_surface: configuracao.color_surface,
      color_text_primary: configuracao.color_text_primary,
      color_text_secondary: configuracao.color_text_secondary,
      color_accent: configuracao.color_accent,
      free_child_age_limit: configuracao.free_child_age_limit,
      free_child_max_per_room: configuracao.free_child_max_per_room,
      checkin_time: configuracao.checkin_time,
      checkout_time: configuracao.checkout_time,
      reception_24h: configuracao.reception_24h,
      reception_opening_time: configuracao.reception_opening_time,
      reception_closing_time: configuracao.reception_closing_time,
      pet_friendly: configuracao.pet_friendly,
      pet_max_weight_kg: configuracao.pet_max_weight_kg,
      smoking_allowed: configuracao.smoking_allowed,
      smoking_sanitization_fee: configuracao.smoking_sanitization_fee,
      parking_type: configuracao.parking_type,
      parking_fee_per_day: configuracao.parking_fee_per_day,
      parking_reservation_required: configuracao.parking_reservation_required,
      parking_covered: configuracao.parking_covered,
      wifi_available: configuracao.wifi_available,
      wifi_type: configuracao.wifi_type,
      wifi_ssid_default: configuracao.wifi_ssid_default,
      wifi_password_default: configuracao.wifi_password_default,
      wifi_show_on_voucher: configuracao.wifi_show_on_voucher,
    }
  }
}
