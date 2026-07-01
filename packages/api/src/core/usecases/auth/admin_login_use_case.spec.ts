import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { AdminLoginUseCase } from './admin_login_use_case'
import { InMemoryAdministratorRepository } from '@/core/repositories/administrators/in-memory/in_memory_administrator_repository'
import { Administrator } from '@/core/entities/administrator'
import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'

const PLAIN_PASSWORD = 'senha123'
const ADMIN_ID = 'admin-001'

describe('AdminLoginUseCase', () => {
  let repo: InMemoryAdministratorRepository
  let sut: AdminLoginUseCase

  beforeEach(async () => {
    repo = new InMemoryAdministratorRepository()
    sut = new AdminLoginUseCase(repo, new BcryptPasswordHasher())

    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10)
    repo.seed(
      new Administrator({
        id: ADMIN_ID,
        nome_completo: 'Super Admin',
        email: 'super@hotelmind.com',
        senha: hashed,
      }),
    )
  })

  it('returns the administrator on valid credentials', async () => {
    const admin = await sut.execute({ email: 'super@hotelmind.com', password: PLAIN_PASSWORD })
    expect(admin.id).toBe(ADMIN_ID)
    expect(admin.nome_completo).toBe('Super Admin')
  })

  it('throws UserNotFoundError when email is unknown', async () => {
    await expect(
      sut.execute({ email: 'ghost@example.com', password: PLAIN_PASSWORD }),
    ).rejects.toThrow(UserNotFoundError)
  })

  it('throws InvalidCredentialsError on wrong password', async () => {
    await expect(
      sut.execute({ email: 'super@hotelmind.com', password: 'wrongpass' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
