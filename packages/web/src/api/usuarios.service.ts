import { api } from '@/lib/axios'
import type { Usuario, PaginatedResponse } from '@hotelmind/contracts'

export interface UsuarioListParams {
  pagina?: number
  limite?: number
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export interface CreateUsuarioPayload {
  nome_completo: string
  email: string
  senha: string
  nascimento: string
  genero: string
  celular: string
  cpf: string
  rg?: string | null
  grupos_ids?: string | null
}

export interface UpdateUsuarioPayload {
  nome_completo?: string
  email?: string
  senha?: string
  nascimento?: string
  genero?: string
  celular?: string
  cpf?: string
  rg?: string | null
  grupos_ids?: string | null
}

export const usuariosService = {
  list: (params: UsuarioListParams) =>
    api.get<PaginatedResponse<Usuario>>('/usuarios', { params }).then(r => r.data),

  get: (id: string) => api.get<Usuario>(`/usuarios/${id}`).then(r => r.data),

  create: (data: CreateUsuarioPayload) =>
    api.post<Usuario>('/usuarios', data).then(r => r.data),

  update: (id: string, data: UpdateUsuarioPayload) =>
    api.put<Usuario>(`/usuarios/${id}`, data).then(r => r.data),
}
