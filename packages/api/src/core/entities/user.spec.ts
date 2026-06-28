import { describe, it, expect } from 'vitest'
import { User } from '@/core/entities/user'

function make_user(nome_completo: string): User {
  return new User({
    id: 'u-1',
    hotel_id: 'h-1',
    nome_completo,
    email: 'test@test.com',
    senha: 'hashed',
    nascimento: new Date('1990-01-01'),
    genero: 'Masculino',
    celular: '11999999999',
    cpf: '00000000000',
  })
}

describe('User.first_name', () => {
  it('returns the first word of a multi-word name', () => {
    expect(make_user('Admin HotelMind').first_name).toBe('Admin')
  })

  it('returns the full name when there is only one word', () => {
    expect(make_user('Maria').first_name).toBe('Maria')
  })

  it('trims leading/trailing whitespace before extracting', () => {
    expect(make_user('  João Silva  ').first_name).toBe('João')
  })

  it('returns empty string when nome_completo is blank', () => {
    expect(make_user('').first_name).toBe('')
  })
})
