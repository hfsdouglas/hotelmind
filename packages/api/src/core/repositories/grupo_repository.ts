import type { Grupo } from '@/core/entities/grupo'
import type { Rota } from '@/core/entities/rota'

export interface PaginationInput {
  pagina: number
  limite: number
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
  status?: string
}

export interface PaginationMeta {
  pagina: number
  limite: number
  total: number
  ultima_pagina: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface CreateGrupoData {
  hotel_id: string
  grupo: string
  descricao?: string | null
  status?: string
}

export interface UpdateGrupoData {
  grupo?: string
  descricao?: string | null
  status?: string
}

export interface IGrupoRepository {
  list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<Grupo>>
  create(data: CreateGrupoData): Promise<Grupo>
  findById(id: string, hotelId: string): Promise<Grupo | null>
  update(id: string, hotelId: string, data: UpdateGrupoData): Promise<Grupo>
  delete(id: string, hotelId: string): Promise<void>
  hasLinkedUsers(id: string, hotelId: string): Promise<boolean>
  listRoutes(grupoId: string): Promise<Rota[]>
  syncRoutes(grupoId: string, rotaIds: string[]): Promise<void>
}
