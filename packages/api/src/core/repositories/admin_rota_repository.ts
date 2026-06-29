import type { Rota } from '@/core/entities/rota'

export interface PaginationInput {
  pagina: number
  limite: number
  busca?: string
  ordenar_por?: string
  direcao?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    pagina: number
    limite: number
    total: number
    ultima_pagina: number
  }
}

export interface CreateRotaData {
  modulo: string
  recurso: string
  rota: string
  icone?: string | null
  ordem?: number
  ativo?: boolean
}

export interface UpdateRotaData {
  modulo?: string
  recurso?: string
  rota?: string
  icone?: string | null
  ordem?: number
  ativo?: boolean
}

export interface IAdminRotaRepository {
  list(params: PaginationInput): Promise<PaginatedResult<Rota>>
  findById(id: string): Promise<Rota | null>
  create(data: CreateRotaData): Promise<Rota>
  update(id: string, data: UpdateRotaData): Promise<Rota>
  delete(id: string): Promise<void>
  findHotelRotas(hotelId: string): Promise<Rota[]>
  setHotelRotas(hotelId: string, rotaIds: string[]): Promise<void>
}
