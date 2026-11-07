import type {
  CategoriaHotel,
  ParkingCovered,
  ParkingType,
  UpdateHotelConfiguracaoInput,
  WifiType,
} from '@hotelmind/contracts'
import { HotelConfiguracao } from '@/core/entities/hotel_configuracao'
import type { DB } from '@/lib/prisma'
import type {
  HotelConfiguracaoRepository,
  HotelConfiguracaoWithHotel,
} from '../hotel_configuracao_repository'

export class PostgresHotelConfiguracaoRepository
  implements HotelConfiguracaoRepository
{
  constructor(private readonly db: DB) {}

  async findByHotelId(
    hotelId: string
  ): Promise<HotelConfiguracaoWithHotel | null> {
    const hotel = await this.db.hotel.findUnique({
      where: { id: hotelId },
      include: {
        configuracao: true,
      },
    })

    if (!hotel) return null

    if (!hotel.configuracao) {
      return null
    }

    const cfg = hotel.configuracao

    const configuracao = HotelConfiguracao.create({
      id: cfg.id,
      hotel_id: cfg.hotel_id,
      created_at: cfg.created_at,
      updated_at: cfg.updated_at,
      categoria: cfg.categoria as CategoriaHotel,
      classificacao_estrelas: cfg.classificacao_estrelas,
      descricao_curta: cfg.descricao_curta,
      descricao_completa: cfg.descricao_completa,
      logo_primary: cfg.logo_primary,
      logo_dark: cfg.logo_dark,
      favicon: cfg.favicon,
      color_primary: cfg.color_primary,
      color_secondary: cfg.color_secondary,
      color_background: cfg.color_background,
      color_surface: cfg.color_surface,
      color_text_primary: cfg.color_text_primary,
      color_text_secondary: cfg.color_text_secondary,
      color_accent: cfg.color_accent,
      free_child_age_limit: cfg.free_child_age_limit,
      free_child_max_per_room: cfg.free_child_max_per_room,
      checkin_time: cfg.checkin_time,
      checkout_time: cfg.checkout_time,
      reception_24h: cfg.reception_24h,
      reception_opening_time: cfg.reception_opening_time,
      reception_closing_time: cfg.reception_closing_time,
      pet_friendly: cfg.pet_friendly,
      pet_max_weight_kg: cfg.pet_max_weight_kg
        ? Number(cfg.pet_max_weight_kg)
        : null,
      smoking_allowed: cfg.smoking_allowed,
      smoking_sanitization_fee: cfg.smoking_sanitization_fee
        ? Number(cfg.smoking_sanitization_fee)
        : null,
      parking_type: cfg.parking_type as ParkingType,
      parking_fee_per_day: cfg.parking_fee_per_day
        ? Number(cfg.parking_fee_per_day)
        : null,
      parking_reservation_required: cfg.parking_reservation_required,
      parking_covered: cfg.parking_covered as ParkingCovered,
      wifi_available: cfg.wifi_available,
      wifi_type: cfg.wifi_type as WifiType,
      wifi_ssid_default: cfg.wifi_ssid_default,
      wifi_password_default: cfg.wifi_password_default,
      wifi_show_on_voucher: cfg.wifi_show_on_voucher,
    })

    return {
      configuracao,
      hotel: {
        nome_hotel: hotel.nome_hotel,
        nome_fantasia: hotel.nome_fantasia,
        razao_social: hotel.razao_social,
        cnpj: hotel.cnpj,
      },
    }
  }

  async upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoWithHotel> {
    const updatedHotel = await this.db.hotel.update({
      where: { id: hotelId },
      data: {
        nome_fantasia: data.hotel_name,
        razao_social: data.legal_name,
        cnpj: data.tax_id,
      },
    })

    const cfg = await this.db.hotelConfiguracao.upsert({
      where: { hotel_id: hotelId },
      create: {
        hotel_id: hotelId,
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
      },
      update: {
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
      },
    })

    const configuracao = HotelConfiguracao.create({
      id: cfg.id,
      hotel_id: cfg.hotel_id,
      created_at: cfg.created_at,
      updated_at: cfg.updated_at,
      categoria: cfg.categoria as CategoriaHotel,
      classificacao_estrelas: cfg.classificacao_estrelas,
      descricao_curta: cfg.descricao_curta,
      descricao_completa: cfg.descricao_completa,
      logo_primary: cfg.logo_primary,
      logo_dark: cfg.logo_dark,
      favicon: cfg.favicon,
      color_primary: cfg.color_primary,
      color_secondary: cfg.color_secondary,
      color_background: cfg.color_background,
      color_surface: cfg.color_surface,
      color_text_primary: cfg.color_text_primary,
      color_text_secondary: cfg.color_text_secondary,
      color_accent: cfg.color_accent,
      free_child_age_limit: cfg.free_child_age_limit,
      free_child_max_per_room: cfg.free_child_max_per_room,
      checkin_time: cfg.checkin_time,
      checkout_time: cfg.checkout_time,
      reception_24h: cfg.reception_24h,
      reception_opening_time: cfg.reception_opening_time,
      reception_closing_time: cfg.reception_closing_time,
      pet_friendly: cfg.pet_friendly,
      pet_max_weight_kg: cfg.pet_max_weight_kg
        ? Number(cfg.pet_max_weight_kg)
        : null,
      smoking_allowed: cfg.smoking_allowed,
      smoking_sanitization_fee: cfg.smoking_sanitization_fee
        ? Number(cfg.smoking_sanitization_fee)
        : null,
      parking_type: cfg.parking_type as ParkingType,
      parking_fee_per_day: cfg.parking_fee_per_day
        ? Number(cfg.parking_fee_per_day)
        : null,
      parking_reservation_required: cfg.parking_reservation_required,
      parking_covered: cfg.parking_covered as ParkingCovered,
      wifi_available: cfg.wifi_available,
      wifi_type: cfg.wifi_type as WifiType,
      wifi_ssid_default: cfg.wifi_ssid_default,
      wifi_password_default: cfg.wifi_password_default,
      wifi_show_on_voucher: cfg.wifi_show_on_voucher,
    })

    return {
      configuracao,
      hotel: {
        nome_hotel: updatedHotel.nome_hotel,
        nome_fantasia: updatedHotel.nome_fantasia,
        razao_social: updatedHotel.razao_social,
        cnpj: updatedHotel.cnpj,
      },
    }
  }
}
