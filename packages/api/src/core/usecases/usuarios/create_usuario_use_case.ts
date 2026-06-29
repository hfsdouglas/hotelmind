import type { IUsuarioRepository, CreateUsuarioData } from '@/core/repositories/usuario_repository'
import type { User } from '@/core/entities/user'
import { UsuarioConflictError } from '@/core/errors/usuario_errors'

export class CreateUsuarioUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(data: CreateUsuarioData): Promise<User> {
    try {
      return await this.usuarioRepository.create(data)
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
