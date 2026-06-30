import type { IUserRepository, CreateUserData } from '@/core/repositories/users/user.repository'
import type { User } from '@/core/entities/user'
import { UsuarioConflictError } from '@/core/errors/usuario_errors'

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserData): Promise<User> {
    try {
      return await this.userRepository.create(data)
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
