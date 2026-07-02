import type { Hotel } from '@/core/entities/hotel'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface HotelPaginationInput extends PaginationInput {
  status?: string
}

export interface CreateHotelData {
  nome_hotel: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  website?: string | null
  status?: string
}

export interface UpdateHotelData {
  nome_hotel?: string
  razao_social?: string
  nome_fantasia?: string
  cnpj?: string
  email_comercial?: string
  telefone_comercial?: string
  website?: string | null
  status?: string
}

export interface IHotelRepository {
  list(params: HotelPaginationInput): Promise<PaginatedResult<Hotel>>
  findById(id: string): Promise<Hotel | null>
  create(data: CreateHotelData): Promise<Hotel>
  update(id: string, data: UpdateHotelData): Promise<Hotel>
  delete(id: string): Promise<void>
}
