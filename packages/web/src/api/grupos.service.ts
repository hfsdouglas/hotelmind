import { api } from '@/lib/axios'
import type { Grupo, PaginatedResponse } from '@hotelmind/contracts'

export interface GrupoListParams {
  pagina?: number
  limite?: number
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  status?: string
}

export interface CreateGrupoPayload {
  grupo: string
  descricao?: string | null
  status?: 'S' | 'N'
}

export interface UpdateGrupoPayload {
  grupo?: string
  descricao?: string | null
  status?: 'S' | 'N'
}

export const gruposService = {
  list: (params: GrupoListParams) =>
    api.get<PaginatedResponse<Grupo>>('/grupos', { params }).then(r => r.data),

  get: (id: string) => api.get<Grupo>(`/grupos/${id}`).then(r => r.data),

  create: (data: CreateGrupoPayload) =>
    api.post<Grupo>('/grupos', data).then(r => r.data),

  update: (id: string, data: UpdateGrupoPayload) =>
    api.put<Grupo>(`/grupos/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/grupos/${id}`),

  listRotas: (id: string) =>
    api.get<RotaItem[]>(`/grupos/${id}/rotas`).then(r => r.data),

  syncRotas: (id: string, rota_ids: string[]) =>
    api.put<RotaItem[]>(`/grupos/${id}/rotas`, { rota_ids }).then(r => r.data),
}

export interface RotaItem {
  id: string
  modulo: string
  recurso: string
  rota: string
  icone: string | null
  ordem: number
  ativo: boolean
}
