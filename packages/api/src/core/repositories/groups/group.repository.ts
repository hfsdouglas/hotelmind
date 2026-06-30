import type { Grupo } from '@/core/entities/grupo'
import type { Rota } from '@/core/entities/rota'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface GroupPaginationInput extends PaginationInput {
  status?: string
}

export interface CreateGroupData {
  hotel_id: string
  grupo: string
  descricao?: string | null
  status?: string
}

export interface UpdateGroupData {
  grupo?: string
  descricao?: string | null
  status?: string
}

export interface IGroupRepository {
  list(hotelId: string, pagination: GroupPaginationInput): Promise<PaginatedResult<Grupo>>
  create(data: CreateGroupData): Promise<Grupo>
  findById(id: string, hotelId: string): Promise<Grupo | null>
  update(id: string, hotelId: string, data: UpdateGroupData): Promise<Grupo>
  delete(id: string, hotelId: string): Promise<void>
  hasLinkedUsers(id: string, hotelId: string): Promise<boolean>
  listRoutes(groupId: string): Promise<Rota[]>
  syncRoutes(groupId: string, routeIds: string[]): Promise<void>
}
