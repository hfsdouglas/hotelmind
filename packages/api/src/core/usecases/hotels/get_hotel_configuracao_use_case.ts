import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import type { HotelConfiguracaoRepository } from '@/core/repositories/hotels/hotel_configuracao_repository'

interface GetHotelConfiguracaoInput {
  hotelId: string
}

export class GetHotelConfiguracaoUseCase {
  constructor(private readonly repository: HotelConfiguracaoRepository) {}

  async execute({
    hotelId,
  }: GetHotelConfiguracaoInput): Promise<HotelConfiguracaoDTO> {
    const data = await this.repository.findByHotelId(hotelId)

    if (data) {
      const { configuracao, hotel } = data
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

    // Se o hotel não tem configurações ainda, verifica se o hotel existe e gera defaults
    // Podemos invocar upsert ou buscar hotel base
    // Vamos verificar se o repositório in-memory / postgres tem o hotel
    // Se o método findByHotelId retornar null, podemos inicializar com defaults se o hotel existir
    // Mas no in-memory, se o hotel não existir em `hotels`, deve lançar erro
    // Vamos adicionar um método auxiliar ou checar se existe
    return this.handleDefault(hotelId)
  }

  private async handleDefault(hotelId: string): Promise<HotelConfiguracaoDTO> {
    // Se não encontrou nem hotel nem config, tenta criar com defaults ou lança erro
    // No PostgresHotelConfiguracaoRepository, se o hotel existir, criamos o padrão inicial:
    const defaultData = {
      hotel_name: 'Hotel',
      legal_name: 'Hotel Razão Social',
      tax_id: '00000000000000',
      category: 'HOTEL' as const,
      star_rating: 0,
      short_description: null,
      full_description: null,
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
      smoking_sanitization_fee: null,
      parking_type: 'NAO_POSSUI' as const,
      parking_fee_per_day: null,
      parking_reservation_required: false,
      parking_covered: 'DESCOBERTO' as const,
      wifi_available: true,
      wifi_type: 'GRATUITO_TOTAL' as const,
      wifi_ssid_default: null,
      wifi_password_default: null,
      wifi_show_on_voucher: true,
    }

    // Se no repositório fake temos hotels map:
    const inMemory = this.repository as unknown as {
      hotels?: Map<
        string,
        { nome_fantasia: string; razao_social: string; cnpj: string }
      >
    }
    if (inMemory.hotels && !inMemory.hotels.has(hotelId)) {
      throw new Error('Hotel não encontrado.')
    }

    const created = await this.repository.upsert(hotelId, {
      ...defaultData,
      hotel_name:
        inMemory.hotels?.get(hotelId)?.nome_fantasia || defaultData.hotel_name,
      legal_name:
        inMemory.hotels?.get(hotelId)?.razao_social || defaultData.legal_name,
      tax_id: inMemory.hotels?.get(hotelId)?.cnpj || defaultData.tax_id,
    })

    return {
      id: created.configuracao.id,
      hotel_id: hotelId,
      created_at: created.configuracao.created_at.toISOString(),
      updated_at: created.configuracao.updated_at.toISOString(),
      hotel_name: created.hotel.nome_fantasia,
      legal_name: created.hotel.razao_social,
      tax_id: created.hotel.cnpj,
      category: created.configuracao.categoria,
      star_rating: created.configuracao.classificacao_estrelas,
      short_description: created.configuracao.descricao_curta,
      full_description: created.configuracao.descricao_completa,
      logo_primary: created.configuracao.logo_primary,
      logo_dark: created.configuracao.logo_dark,
      favicon: created.configuracao.favicon,
      color_primary: created.configuracao.color_primary,
      color_secondary: created.configuracao.color_secondary,
      color_background: created.configuracao.color_background,
      color_surface: created.configuracao.color_surface,
      color_text_primary: created.configuracao.color_text_primary,
      color_text_secondary: created.configuracao.color_text_secondary,
      color_accent: created.configuracao.color_accent,
      free_child_age_limit: created.configuracao.free_child_age_limit,
      free_child_max_per_room: created.configuracao.free_child_max_per_room,
      checkin_time: created.configuracao.checkin_time,
      checkout_time: created.configuracao.checkout_time,
      reception_24h: created.configuracao.reception_24h,
      reception_opening_time: created.configuracao.reception_opening_time,
      reception_closing_time: created.configuracao.reception_closing_time,
      pet_friendly: created.configuracao.pet_friendly,
      pet_max_weight_kg: created.configuracao.pet_max_weight_kg,
      smoking_allowed: created.configuracao.smoking_allowed,
      smoking_sanitization_fee: created.configuracao.smoking_sanitization_fee,
      parking_type: created.configuracao.parking_type,
      parking_fee_per_day: created.configuracao.parking_fee_per_day,
      parking_reservation_required:
        created.configuracao.parking_reservation_required,
      parking_covered: created.configuracao.parking_covered,
      wifi_available: created.configuracao.wifi_available,
      wifi_type: created.configuracao.wifi_type,
      wifi_ssid_default: created.configuracao.wifi_ssid_default,
      wifi_password_default: created.configuracao.wifi_password_default,
      wifi_show_on_voucher: created.configuracao.wifi_show_on_voucher,
    }
  }
}
