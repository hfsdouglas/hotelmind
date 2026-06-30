import type { IUserRepository, UpdateUserData } from '@/core/repositories/users/user.repository'
import type { User } from '@/core/entities/user'
import { UsuarioNotFoundError, UsuarioConflictError } from '@/core/errors/usuario_errors'

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, hotelId: string, data: UpdateUserData): Promise<User> {
    const existing = await this.userRepository.findById(id, hotelId)
    if (!existing) throw new UsuarioNotFoundError()

    try {
      return await this.userRepository.update(id, hotelId, data)
    } catch (err: unknown) {
      if (isUniqueConstraintError(err)) {
        throw new UsuarioConflictError()
      }
      throw err
    }
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}
