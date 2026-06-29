import type { Administrator } from '@/core/entities/administrator'
import type { IAdministratorRepository } from '@/core/repositories/administrator_repository'
import type { IPasswordHasher } from '@/core/services/password_hasher'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'

interface AdminLoginInput {
  email: string
  password: string
}

export class AdminLoginUseCase {
  constructor(
    private readonly repository: IAdministratorRepository,
    private readonly password_hasher: IPasswordHasher,
  ) {}

  async execute({ email, password }: AdminLoginInput): Promise<Administrator> {
    const admin = await this.repository.findByEmail(email)
    if (!admin) throw new UserNotFoundError()

    const valid = await this.password_hasher.compare(password, admin.senha)
    if (!valid) throw new InvalidCredentialsError()

    return admin
  }
}
