import type { User } from '@/core/entities/user'
import { UsuarioNotFoundError } from '@/core/errors/usuario_errors'
import type { IUserRepository } from '@/core/repositories/users/user.repository'

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, hotelId: string): Promise<User> {
    const user = await this.userRepository.findById(id, hotelId)
    if (!user) throw new UsuarioNotFoundError()
    return user
  }
}
