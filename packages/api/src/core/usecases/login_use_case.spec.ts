import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { LoginUseCase } from '@/core/usecases/login_use_case'
import { InMemoryUserRepository } from '@/db/repositories/users/in-memory/in_memory_user_repository'
import { InMemoryHotelRepository } from '@/db/repositories/hotels/in-memory/in_memory_hotel_repository'
import { User } from '@/core/entities/user'
import { Hotel } from '@/core/entities/hotel'
import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'
const PLAIN_PASSWORD = 'senha123'

describe('LoginUseCase', () => {
  let user_repo: InMemoryUserRepository
  let hotel_repo: InMemoryHotelRepository
  let use_case: LoginUseCase

  beforeEach(async () => {
    user_repo = new InMemoryUserRepository()
    hotel_repo = new InMemoryHotelRepository()
    use_case = new LoginUseCase(user_repo, hotel_repo, new BcryptPasswordHasher())

    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10)

    hotel_repo.seed(
      new Hotel({
        id: HOTEL_ID,
        nome_hotel: 'HotelMind',
        nome_fantasia: 'HotelMind',
        razao_social: 'HotelMind Ltda',
        cnpj: '00000000000000',
        email_comercial: 'contato@hotelmind.com.br',
        telefone_comercial: '11999999999',
      }),
    )

    user_repo.seed(
      new User({
        id: USER_ID,
        hotel_id: HOTEL_ID,
        nome_completo: 'Admin HotelMind',
        email: 'admin@hotelmind.com.br',
        senha: hashed,
        nascimento: new Date('1990-01-01'),
        genero: 'Masculino',
        celular: '11999999999',
        cpf: '00000000000',
      }),
    )
  })

  it('returns user and hotel on valid credentials', async () => {
    const result = await use_case.execute({
      email: 'admin@hotelmind.com.br',
      password: PLAIN_PASSWORD,
    })

    expect(result.user.id).toBe(USER_ID)
    expect(result.hotel.id).toBe(HOTEL_ID)
  })

  it('throws UserNotFoundError when email is unknown', async () => {
    await expect(
      use_case.execute({ email: 'unknown@example.com', password: PLAIN_PASSWORD }),
    ).rejects.toThrow(UserNotFoundError)
  })

  it('throws InvalidCredentialsError on wrong password', async () => {
    await expect(
      use_case.execute({ email: 'admin@hotelmind.com.br', password: 'wrong' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
