import { describe, it, expect, beforeEach } from 'vitest'
import { GetUserUseCase } from './get_user_use_case'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { User } from '@/core/entities/user'
import { UsuarioNotFoundError } from '@/core/errors/usuario_errors'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'

describe('GetUserUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: GetUserUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new GetUserUseCase(repo)

    repo.seed(
      new User({
        id: USER_ID,
        hotel_id: HOTEL_ID,
        nome_completo: 'Ana Lima',
        email: 'ana@test.com',
        senha: 'hashed',
        nascimento: new Date('1990-01-01'),
        genero: 'Feminino',
        celular: '11999999999',
        cpf: '12345678901',
      }),
    )
  })

  it('returns the user by id and hotelId', async () => {
    const user = await sut.execute(USER_ID, HOTEL_ID)
    expect(user.id).toBe(USER_ID)
    expect(user.nome_completo).toBe('Ana Lima')
  })

  it('throws UsuarioNotFoundError when user does not exist', async () => {
    await expect(sut.execute('non-existent', HOTEL_ID)).rejects.toThrow(UsuarioNotFoundError)
  })

  it('throws UsuarioNotFoundError when hotelId does not match', async () => {
    await expect(sut.execute(USER_ID, 'other-hotel')).rejects.toThrow(UsuarioNotFoundError)
  })
})
