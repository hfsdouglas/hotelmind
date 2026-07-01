import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateUserUseCase } from './create_user_use_case'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { UsuarioConflictError } from '@/core/errors/usuario_errors'

const HOTEL_ID = 'hotel-001'

const BASE_USER = {
  hotel_id: HOTEL_ID,
  nome_completo: 'João Silva',
  email: 'joao@test.com',
  senha: 'senha123',
  nascimento: new Date('1990-01-01'),
  genero: 'Masculino',
  celular: '11999999999',
  cpf: '12345678901',
}

describe('CreateUserUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: CreateUserUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new CreateUserUseCase(repo)
  })

  it('creates a user with the correct hotelId', async () => {
    const user = await sut.execute(BASE_USER)
    expect(user.hotel_id).toBe(HOTEL_ID)
    expect(user.nome_completo).toBe('João Silva')
    expect(user.email).toBe('joao@test.com')
  })

  it('throws UsuarioConflictError when repository throws P2002', async () => {
    vi.spyOn(repo, 'create').mockRejectedValueOnce({ code: 'P2002' })
    await expect(sut.execute(BASE_USER)).rejects.toThrow(UsuarioConflictError)
  })

  it('rethrows unexpected errors', async () => {
    vi.spyOn(repo, 'create').mockRejectedValueOnce(new Error('db down'))
    await expect(sut.execute(BASE_USER)).rejects.toThrow('db down')
  })
})
