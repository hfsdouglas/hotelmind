import type { Rota } from '@/core/entities/rota'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface CreateRouteData {
  modulo: string
  recurso: string
  rota: string
  icone?: string | null
  ordem?: number
  ativo?: boolean
}

export interface UpdateRouteData {
  modulo?: string
  recurso?: string
  rota?: string
  icone?: string | null
  ordem?: number
  ativo?: boolean
}

export interface IRouteRepository {
  list(params: PaginationInput): Promise<PaginatedResult<Rota>>
  findById(id: string): Promise<Rota | null>
  create(data: CreateRouteData): Promise<Rota>
  update(id: string, data: UpdateRouteData): Promise<Rota>
  delete(id: string): Promise<void>
  findByHotel(hotelId: string): Promise<Rota[]>
  findByUsuario(hotelId: string, grupoIds: string[]): Promise<Rota[]>
  findHotelRoutes(hotelId: string): Promise<Rota[]>
  setHotelRoutes(hotelId: string, routeIds: string[]): Promise<void>
}
