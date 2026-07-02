import { api } from '@/lib/axios'
import type { LoginFormData } from '@/schemas/auth.schema'
import type { LoginResponse, RotaMenu, SuporteSession } from '@/types/auth'

export interface MeResponse {
  user: {
    id: string
    nome_completo: string
    email: string
    hotel_id: string
    grupos_ids?: string | null
  }
  hotel: {
    id: string
    nome_hotel: string
    nome_fantasia: string
    cnpj: string
  }
  rotas: RotaMenu[]
  suporte?: SuporteSession
}

export const authService = {
  login: (data: LoginFormData) =>
    api.post<LoginResponse>('/auth/login', data).then(res => res.data),
  me: () => api.get<MeResponse>('/auth/me').then(res => res.data),
  logout: () =>
    api.post<{ message: string }>('/auth/logout').then(res => res.data),
}
