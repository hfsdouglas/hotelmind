import type { IUsuarioRepository } from '@/core/repositories/usuario_repository'
import type { PaginationInput, PaginatedResult } from '@/core/repositories/grupo_repository'
import type { User } from '@/core/entities/user'

export class ListUsuariosUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(hotelId: string, pagination: PaginationInput): Promise<PaginatedResult<User>> {
    return this.usuarioRepository.list(hotelId, pagination)
  }
}
