import type { User } from '@/core/entities/user'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface CreateUserData {
  hotel_id: string
  nome_completo: string
  email: string
  senha: string
  nascimento: Date
  genero: string
  celular: string
  cpf: string
  rg?: string | null
  grupos_ids?: string | null
}

export interface UpdateUserData {
  nome_completo?: string
  email?: string
  senha?: string
  nascimento?: Date
  genero?: string
  celular?: string
  cpf?: string
  rg?: string | null
  grupos_ids?: string | null
}

export interface IUserRepository {
  list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>>
  create(data: CreateUserData): Promise<User>
  findById(id: string, hotelId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, hotelId: string, data: UpdateUserData): Promise<User>
}
