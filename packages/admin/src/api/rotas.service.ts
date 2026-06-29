import { api } from '@/lib/axios'

export interface Rota {
  id: string
  modulo: string
  recurso: string
  rota: string
  icone: string | null
  ordem: number
  ativo: boolean
}

export interface RotaFormData {
  modulo: string
  recurso: string
  rota: string
  icone?: string | null
  ordem?: number
  ativo?: boolean
}

export interface PaginatedRotas {
  data: Rota[]
  meta: { pagina: number; limite: number; total: number; ultima_pagina: number }
}

export const rotasService = {
  list: (params: Record<string, unknown>) =>
    api.get<PaginatedRotas>('/admin/rotas', { params }).then(r => r.data),
  findById: (id: string) => api.get<Rota>(`/admin/rotas/${id}`).then(r => r.data),
  create: (data: RotaFormData) => api.post<Rota>('/admin/rotas', data).then(r => r.data),
  update: (id: string, data: Partial<RotaFormData>) =>
    api.put<Rota>(`/admin/rotas/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/admin/rotas/${id}`),
}
