import type { IUsuarioRepository, UpdateUsuarioData } from '@/core/repositories/usuario_repository'
import type { User } from '@/core/entities/user'
import { UsuarioNotFoundError, UsuarioConflictError } from '@/core/errors/usuario_errors'

export class UpdateUsuarioUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(id: string, hotelId: string, data: UpdateUsuarioData): Promise<User> {
    const existing = await this.usuarioRepository.findById(id, hotelId)
    if (!existing) throw new UsuarioNotFoundError()

    try {
      return await this.usuarioRepository.update(id, hotelId, data)
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
