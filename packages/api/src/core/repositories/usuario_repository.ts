import type { User } from '@/core/entities/user'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/grupo_repository'

export interface CreateUsuarioData {
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

export interface UpdateUsuarioData {
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

export interface IUsuarioRepository {
  list(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>>
  create(data: CreateUsuarioData): Promise<User>
  findById(id: string, hotelId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, hotelId: string, data: UpdateUsuarioData): Promise<User>
}
