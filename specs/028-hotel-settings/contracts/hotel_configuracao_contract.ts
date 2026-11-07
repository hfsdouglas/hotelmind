/**
 * Contract: Configurações do Hotel (Frontend Web <-> Backend API)
 * Path: packages/.contracts/src/hotel_configuracao.ts
 */

export type CategoriaHotel = 'HOTEL' | 'POUSADA' | 'RESORT' | 'HOSTEL' | 'FLAT'

export type ParkingType =
  | 'GRATUITO'
  | 'PAGO_LOCAL'
  | 'CONVENIADO'
  | 'NAO_POSSUI'
export type ParkingCovered = 'COBERTO' | 'DESCOBERTO' | 'MISTO'
export type WifiType = 'GRATUITO_TOTAL' | 'GRATUITO_AREAS_COMUNS' | 'PAGO'

export interface HotelConfiguracaoDTO {
  id: string
  hotel_id: string
  created_at: string
  updated_at: string

  // Dados Institucionais sincronizados
  hotel_name: string
  legal_name: string
  tax_id: string
  category: CategoriaHotel
  star_rating: number
  short_description: string | null
  full_description: string | null

  // Identidade Visual & Tema
  logo_primary: string | null
  logo_dark: string | null
  favicon: string | null
  color_primary: string
  color_secondary: string
  color_background: string
  color_surface: string
  color_text_primary: string
  color_text_secondary: string
  color_accent: string

  // Políticas de Crianças (apenas gratuidades)
  free_child_age_limit: number
  free_child_max_per_room: number

  // Horários & Operação
  checkin_time: string
  checkout_time: string
  reception_24h: boolean
  reception_opening_time: string | null
  reception_closing_time: string | null

  // Regras da Casa (Pets e Fumo)
  pet_friendly: boolean
  pet_max_weight_kg: number | null
  smoking_allowed: boolean
  smoking_sanitization_fee: number | null

  // Serviços Operacionais (Estacionamento & Wi-Fi)
  parking_type: ParkingType
  parking_fee_per_day: number | null
  parking_reservation_required: boolean
  parking_covered: ParkingCovered
  wifi_available: boolean
  wifi_type: WifiType
  wifi_ssid_default: string | null
  wifi_password_default: string | null
  wifi_show_on_voucher: boolean
}

export type UpdateHotelConfiguracaoInput = Omit<
  HotelConfiguracaoDTO,
  'id' | 'hotel_id' | 'created_at' | 'updated_at'
>
