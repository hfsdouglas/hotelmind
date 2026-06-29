import { api } from '@/lib/axios'

export interface Administrador {
  id: string
  nome_completo: string
  email: string
  status: string
}

export interface AdministradorFormData {
  nome_completo: string
  email: string
  senha: string
  status?: string
}

export interface AdministradorUpdateData {
  nome_completo?: string
  email?: string
  senha?: string
  status?: string
}

export interface PaginatedAdministradores {
  data: Administrador[]
  meta: { pagina: number; limite: number; total: number; ultima_pagina: number }
}

export const administradoresService = {
  list: (params: Record<string, unknown>) =>
    api.get<PaginatedAdministradores>('/admin/administradores', { params }).then(r => r.data),
  findById: (id: string) =>
    api.get<Administrador>(`/admin/administradores/${id}`).then(r => r.data),
  create: (data: AdministradorFormData) =>
    api.post<Administrador>('/admin/administradores', data).then(r => r.data),
  update: (id: string, data: AdministradorUpdateData) =>
    api.put<Administrador>(`/admin/administradores/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/admin/administradores/${id}`),
}
