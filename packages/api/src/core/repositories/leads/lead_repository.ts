import type { Lead } from '@/core/entities/lead'
import type {
  PaginatedResult,
  PaginationInput,
} from '@/core/repositories/pagination'

export interface CreateLeadData {
  hotel_id: string
  nome: string
  telefone: string
  email: string
}

export interface UpdateLeadData {
  id: string
  hotel_id: string
  nome?: string
  telefone?: string
  email?: string
}

export interface ILeadRepository {
  create(data: CreateLeadData): Promise<Lead>
  update(data: UpdateLeadData): Promise<Lead>
  find_by_id(id: string, hotel_id: string): Promise<Lead | null>
  find_by_contact(
    hotel_id: string,
    contact: { email?: string; telefone?: string }
  ): Promise<Lead | null>
  list(hotel_id: string, input: PaginationInput): Promise<PaginatedResult<Lead>>
}
