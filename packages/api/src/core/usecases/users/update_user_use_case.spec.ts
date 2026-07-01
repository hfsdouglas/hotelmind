import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateUserUseCase } from './update_user_use_case'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { User } from '@/core/entities/user'
import { UsuarioNotFoundError, UsuarioConflictError } from '@/core/errors/usuario_errors'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'

describe('UpdateUserUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: UpdateUserUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new UpdateUserUseCase(repo)

    repo.seed(
      new User({
        id: USER_ID,
        hotel_id: HOTEL_ID,
        nome_completo: 'Pedro Costa',
        email: 'pedro@test.com',
        senha: 'hashed',
        nascimento: new Date('1990-01-01'),
        genero: 'Masculino',
        celular: '11999999999',
        cpf: '12345678901',
      }),
    )
  })

  it('updates the user name', async () => {
    const updated = await sut.execute(USER_ID, HOTEL_ID, { nome_completo: 'Pedro Alves' })
    expect(updated.nome_completo).toBe('Pedro Alves')
  })

  it('throws UsuarioNotFoundError when user does not exist', async () => {
    await expect(sut.execute('missing', HOTEL_ID, { nome_completo: 'X' })).rejects.toThrow(
      UsuarioNotFoundError,
    )
  })

  it('throws UsuarioConflictError when repository throws P2002', async () => {
    vi.spyOn(repo, 'update').mockRejectedValueOnce({ code: 'P2002' })
    await expect(sut.execute(USER_ID, HOTEL_ID, { email: 'dup@test.com' })).rejects.toThrow(
      UsuarioConflictError,
    )
  })
})
