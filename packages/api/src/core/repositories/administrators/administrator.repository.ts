import type { Administrator } from '@/core/entities/administrator'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/pagination'

export interface CreateAdministratorData {
  nome_completo: string
  email: string
  senha: string
  status?: string
}

export interface UpdateAdministratorData {
  nome_completo?: string
  email?: string
  senha?: string
  status?: string
}

export interface IAdministratorRepository {
  list(params: PaginationInput): Promise<PaginatedResult<Administrator>>
  findById(id: string): Promise<Administrator | null>
  findByEmail(email: string): Promise<Administrator | null>
  create(data: CreateAdministratorData): Promise<Administrator>
  update(id: string, data: UpdateAdministratorData): Promise<Administrator>
  delete(id: string): Promise<void>
}
