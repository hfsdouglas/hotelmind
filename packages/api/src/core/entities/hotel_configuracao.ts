import type {
  CategoriaHotel,
  ParkingCovered,
  ParkingType,
  WifiType,
} from '@hotelmind/contracts'

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export interface HotelConfiguracaoProps {
  id: string
  hotel_id: string
  created_at?: Date
  updated_at?: Date

  // Identidade & Tema
  categoria: CategoriaHotel
  classificacao_estrelas: number
  descricao_curta?: string | null
  descricao_completa?: string | null
  logo_primary?: string | null
  logo_dark?: string | null
  favicon?: string | null
  color_primary: string
  color_secondary: string
  color_background: string
  color_surface: string
  color_text_primary: string
  color_text_secondary: string
  color_accent: string

  // Crianças (apenas gratuidades)
  free_child_age_limit: number
  free_child_max_per_room: number

  // Horários & Operação
  checkin_time: string
  checkout_time: string
  reception_24h: boolean
  reception_opening_time?: string | null
  reception_closing_time?: string | null

  // Políticas & Regras (Pets e Fumo)
  pet_friendly: boolean
  pet_max_weight_kg?: number | null
  smoking_allowed: boolean
  smoking_sanitization_fee?: number | null

  // Serviços Operacionais (Estacionamento & Wi-Fi)
  parking_type: ParkingType
  parking_fee_per_day?: number | null
  parking_reservation_required: boolean
  parking_covered: ParkingCovered
  wifi_available: boolean
  wifi_type: WifiType
  wifi_ssid_default?: string | null
  wifi_password_default?: string | null
  wifi_show_on_voucher: boolean
}

export class HotelConfiguracao {
  readonly id: string
  readonly hotel_id: string
  readonly created_at: Date
  readonly updated_at: Date

  readonly categoria: CategoriaHotel
  readonly classificacao_estrelas: number
  readonly descricao_curta: string | null
  readonly descricao_completa: string | null
  readonly logo_primary: string | null
  readonly logo_dark: string | null
  readonly favicon: string | null
  readonly color_primary: string
  readonly color_secondary: string
  readonly color_background: string
  readonly color_surface: string
  readonly color_text_primary: string
  readonly color_text_secondary: string
  readonly color_accent: string

  readonly free_child_age_limit: number
  readonly free_child_max_per_room: number

  readonly checkin_time: string
  readonly checkout_time: string
  readonly reception_24h: boolean
  readonly reception_opening_time: string | null
  readonly reception_closing_time: string | null

  readonly pet_friendly: boolean
  readonly pet_max_weight_kg: number | null
  readonly smoking_allowed: boolean
  readonly smoking_sanitization_fee: number | null

  readonly parking_type: ParkingType
  readonly parking_fee_per_day: number | null
  readonly parking_reservation_required: boolean
  readonly parking_covered: ParkingCovered
  readonly wifi_available: boolean
  readonly wifi_type: WifiType
  readonly wifi_ssid_default: string | null
  readonly wifi_password_default: string | null
  readonly wifi_show_on_voucher: boolean

  constructor(props: HotelConfiguracaoProps) {
    this.validate(props)

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.created_at = props.created_at ?? new Date()
    this.updated_at = props.updated_at ?? new Date()

    this.categoria = props.categoria
    this.classificacao_estrelas = props.classificacao_estrelas
    this.descricao_curta = props.descricao_curta ?? null
    this.descricao_completa = props.descricao_completa ?? null
    this.logo_primary = props.logo_primary ?? null
    this.logo_dark = props.logo_dark ?? null
    this.favicon = props.favicon ?? null
    this.color_primary = props.color_primary
    this.color_secondary = props.color_secondary
    this.color_background = props.color_background
    this.color_surface = props.color_surface
    this.color_text_primary = props.color_text_primary
    this.color_text_secondary = props.color_text_secondary
    this.color_accent = props.color_accent

    this.free_child_age_limit = props.free_child_age_limit
    this.free_child_max_per_room = props.free_child_max_per_room

    this.checkin_time = props.checkin_time
    this.checkout_time = props.checkout_time
    this.reception_24h = props.reception_24h
    this.reception_opening_time = props.reception_opening_time ?? null
    this.reception_closing_time = props.reception_closing_time ?? null

    this.pet_friendly = props.pet_friendly
    this.pet_max_weight_kg = props.pet_max_weight_kg ?? null
    this.smoking_allowed = props.smoking_allowed
    this.smoking_sanitization_fee = props.smoking_sanitization_fee ?? null

    this.parking_type = props.parking_type
    this.parking_fee_per_day = props.parking_fee_per_day ?? null
    this.parking_reservation_required = props.parking_reservation_required
    this.parking_covered = props.parking_covered
    this.wifi_available = props.wifi_available
    this.wifi_type = props.wifi_type
    this.wifi_ssid_default = props.wifi_ssid_default ?? null
    this.wifi_password_default = props.wifi_password_default ?? null
    this.wifi_show_on_voucher = props.wifi_show_on_voucher
  }

  private validate(props: HotelConfiguracaoProps) {
    if (!HEX_COLOR_REGEX.test(props.color_primary)) {
      throw new Error('Cor primária inválida. Deve ser um código HEX válido.')
    }
    if (!HEX_COLOR_REGEX.test(props.color_secondary)) {
      throw new Error('Cor secundária inválida. Deve ser um código HEX válido.')
    }
    if (!HEX_COLOR_REGEX.test(props.color_background)) {
      throw new Error('Cor de fundo inválida. Deve ser um código HEX válido.')
    }
    if (!HEX_COLOR_REGEX.test(props.color_surface)) {
      throw new Error(
        'Cor de superfície inválida. Deve ser um código HEX válido.'
      )
    }
    if (!HEX_COLOR_REGEX.test(props.color_text_primary)) {
      throw new Error(
        'Cor de texto primário inválida. Deve ser um código HEX válido.'
      )
    }
    if (!HEX_COLOR_REGEX.test(props.color_text_secondary)) {
      throw new Error(
        'Cor de texto secundário inválida. Deve ser um código HEX válido.'
      )
    }
    if (!HEX_COLOR_REGEX.test(props.color_accent)) {
      throw new Error(
        'Cor de destaque inválida. Deve ser um código HEX válido.'
      )
    }

    if (!props.reception_24h) {
      if (!props.reception_opening_time || !props.reception_closing_time) {
        throw new Error(
          'Quando a recepção não funciona 24h, os horários de funcionamento da recepção são obrigatórios.'
        )
      }
    }

    if (props.free_child_age_limit < 0) {
      throw new Error('A idade limite de gratuidade não pode ser negativa.')
    }
    if (props.free_child_max_per_room < 0) {
      throw new Error(
        'O número máximo de crianças gratuitas não pode ser negativo.'
      )
    }
  }

  static create(props: HotelConfiguracaoProps): HotelConfiguracao {
    return new HotelConfiguracao(props)
  }
}
