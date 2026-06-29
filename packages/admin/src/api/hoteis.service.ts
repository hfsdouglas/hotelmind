import { api } from '@/lib/axios'

export interface Hotel {
  id: string
  nome_hotel: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  website: string | null
}

export interface HotelFormData {
  nome_hotel: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  website?: string | null
}

export interface PaginatedHoteis {
  data: Hotel[]
  meta: { pagina: number; limite: number; total: number; ultima_pagina: number }
}

export interface Rota {
  id: string
  modulo: string
  recurso: string
  rota: string
  icone: string | null
  ordem: number
  ativo: boolean
}

export const hoteisService = {
  list: (params: Record<string, unknown>) =>
    api.get<PaginatedHoteis>('/admin/hoteis', { params }).then(r => r.data),
  findById: (id: string) => api.get<Hotel>(`/admin/hoteis/${id}`).then(r => r.data),
  create: (data: HotelFormData) => api.post<Hotel>('/admin/hoteis', data).then(r => r.data),
  update: (id: string, data: Partial<HotelFormData>) =>
    api.put<Hotel>(`/admin/hoteis/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/admin/hoteis/${id}`),
  getRotas: (id: string) => api.get<Rota[]>(`/admin/hoteis/${id}/rotas`).then(r => r.data),
  setRotas: (id: string, rota_ids: string[]) =>
    api.put(`/admin/hoteis/${id}/rotas`, { rota_ids }),
}
