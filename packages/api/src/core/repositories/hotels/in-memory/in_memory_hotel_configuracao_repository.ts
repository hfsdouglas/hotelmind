import type { UpdateHotelConfiguracaoInput } from '@hotelmind/contracts'
import { HotelConfiguracao } from '@/core/entities/hotel_configuracao'
import type {
  HotelConfiguracaoRepository,
  HotelConfiguracaoWithHotel,
} from '../hotel_configuracao_repository'

interface StoredHotel {
  id: string
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
}

export class InMemoryHotelConfiguracaoRepository
  implements HotelConfiguracaoRepository
{
  public items: Map<string, HotelConfiguracao> = new Map()
  public hotels: Map<string, StoredHotel> = new Map()

  seedHotel(hotel: StoredHotel) {
    this.hotels.set(hotel.id, hotel)
  }

  async findByHotelId(
    hotelId: string
  ): Promise<HotelConfiguracaoWithHotel | null> {
    const hotel = this.hotels.get(hotelId)
    if (!hotel) return null

    const configuracao = this.items.get(hotelId)
    if (!configuracao) return null

    return {
      configuracao,
      hotel,
    }
  }

  async upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoWithHotel> {
    let hotel = this.hotels.get(hotelId)
    if (!hotel) {
      hotel = {
        id: hotelId,
        nome_hotel: data.hotel_name,
        nome_fantasia: data.hotel_name,
        razao_social: data.legal_name,
        cnpj: data.tax_id,
      }
      this.hotels.set(hotelId, hotel)
    } else {
      hotel.nome_fantasia = data.hotel_name
      hotel.razao_social = data.legal_name
      hotel.cnpj = data.tax_id
    }

    const existing = this.items.get(hotelId)
    const id = existing ? existing.id : `cfg-${Date.now()}`

    const configuracao = HotelConfiguracao.create({
      id,
      hotel_id: hotelId,
      created_at: existing?.created_at,
      updated_at: new Date(),
      categoria: data.category,
      classificacao_estrelas: data.star_rating,
      descricao_curta: data.short_description,
      descricao_completa: data.full_description,
      logo_primary: data.logo_primary,
      logo_dark: data.logo_dark,
      favicon: data.favicon,
      color_primary: data.color_primary,
      color_secondary: data.color_secondary,
      color_background: data.color_background,
      color_surface: data.color_surface,
      color_text_primary: data.color_text_primary,
      color_text_secondary: data.color_text_secondary,
      color_accent: data.color_accent,
      free_child_age_limit: data.free_child_age_limit,
      free_child_max_per_room: data.free_child_max_per_room,
      checkin_time: data.checkin_time,
      checkout_time: data.checkout_time,
      reception_24h: data.reception_24h,
      reception_opening_time: data.reception_opening_time,
      reception_closing_time: data.reception_closing_time,
      pet_friendly: data.pet_friendly,
      pet_max_weight_kg: data.pet_max_weight_kg,
      smoking_allowed: data.smoking_allowed,
      smoking_sanitization_fee: data.smoking_sanitization_fee,
      parking_type: data.parking_type,
      parking_fee_per_day: data.parking_fee_per_day,
      parking_reservation_required: data.parking_reservation_required,
      parking_covered: data.parking_covered,
      wifi_available: data.wifi_available,
      wifi_type: data.wifi_type,
      wifi_ssid_default: data.wifi_ssid_default,
      wifi_password_default: data.wifi_password_default,
      wifi_show_on_voucher: data.wifi_show_on_voucher,
    })

    this.items.set(hotelId, configuracao)

    return {
      configuracao,
      hotel,
    }
  }
}
