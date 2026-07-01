import { describe, it, expect, beforeEach } from 'vitest'
import { ListUsersUseCase } from './list_users_use_case'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { User } from '@/core/entities/user'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'

function make_user(id: string, hotel_id: string, nome_completo: string): User {
  return new User({
    id,
    hotel_id,
    nome_completo,
    email: `${id}@test.com`,
    senha: 'hashed',
    nascimento: new Date('1990-01-01'),
    genero: 'Masculino',
    celular: '11999999999',
    cpf: id.padEnd(11, '0').slice(0, 11),
  })
}

describe('ListUsersUseCase', () => {
  let repo: InMemoryUserRepository
  let sut: ListUsersUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    sut = new ListUsersUseCase(repo)

    repo.seed(make_user('u1', HOTEL_A, 'Ana Lima'))
    repo.seed(make_user('u2', HOTEL_A, 'Carlos Souza'))
    repo.seed(make_user('u3', HOTEL_B, 'Maria Pereira'))
  })

  it('returns only users for the given hotelId', async () => {
    const result = await sut.execute(HOTEL_A, { pagina: 1, limite: 50 })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(u => u.hotel_id === HOTEL_A)).toBe(true)
  })

  it('respects pagination limits', async () => {
    const result = await sut.execute(HOTEL_A, { pagina: 1, limite: 1 })
    expect(result.data).toHaveLength(1)
    expect(result.meta.total).toBe(2)
    expect(result.meta.ultima_pagina).toBe(2)
  })

  it('returns empty list for unknown hotel', async () => {
    const result = await sut.execute('hotel-unknown', { pagina: 1, limite: 50 })
    expect(result.data).toHaveLength(0)
  })
})
