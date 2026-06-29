import type { RotaMenu } from './rotas.js'

export interface AuthUser {
  id: string
  nome_completo: string
  email: string
  hotel_id: string
  grupos_ids?: string | null
}

export interface AuthHotel {
  id: string
  nome_hotel: string
  nome_fantasia: string
  cnpj: string
}

export interface LoginResponse {
  user: AuthUser
  hotel: AuthHotel
  message: string
  rotas: RotaMenu[]
}

export type { RotaMenu }
