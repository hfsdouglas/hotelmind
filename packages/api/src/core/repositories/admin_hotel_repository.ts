import type { Hotel } from '@/core/entities/hotel'

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

export interface CreateHotelData {
  nome_hotel: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  website?: string | null
}

export interface UpdateHotelData {
  nome_hotel?: string
  razao_social?: string
  nome_fantasia?: string
  cnpj?: string
  email_comercial?: string
  telefone_comercial?: string
  website?: string | null
}

export interface IAdminHotelRepository {
  list(params: PaginationInput): Promise<PaginatedResult<Hotel>>
  findById(id: string): Promise<Hotel | null>
  create(data: CreateHotelData): Promise<Hotel>
  update(id: string, data: UpdateHotelData): Promise<Hotel>
  delete(id: string): Promise<void>
}
