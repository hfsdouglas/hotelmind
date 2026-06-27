export interface AuthUser {
  id: string
  nome_completo: string
  email: string
  hotel_id: string
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
}
