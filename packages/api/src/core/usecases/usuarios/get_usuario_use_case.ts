import type { IUsuarioRepository } from '@/core/repositories/usuario_repository'
import type { User } from '@/core/entities/user'
import { UsuarioNotFoundError } from '@/core/errors/usuario_errors'

export class GetUsuarioUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(id: string, hotelId: string): Promise<User> {
    const usuario = await this.usuarioRepository.findById(id, hotelId)
    if (!usuario) throw new UsuarioNotFoundError()
    return usuario
  }
}
