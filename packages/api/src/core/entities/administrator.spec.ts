import { describe, it, expect } from 'vitest'
import { Administrator } from './administrator'

function make_admin(nome_completo: string, status?: string): Administrator {
  return new Administrator({
    id: 'a-1',
    nome_completo,
    email: 'admin@test.com',
    senha: 'hashed',
    status,
  })
}

describe('Administrator.first_name', () => {
  it('returns the first word of a multi-word name', () => {
    expect(make_admin('João Silva').first_name).toBe('João')
  })

  it('returns the full name when there is only one word', () => {
    expect(make_admin('Carlos').first_name).toBe('Carlos')
  })

  it('trims leading/trailing whitespace before extracting', () => {
    expect(make_admin('  Maria Souza  ').first_name).toBe('Maria')
  })

  it('returns empty string when nome_completo is blank', () => {
    expect(make_admin('').first_name).toBe('')
  })
})

describe('Administrator.status', () => {
  it('defaults to S when not provided', () => {
    expect(make_admin('João').status).toBe('S')
  })

  it('respects the provided status', () => {
    expect(make_admin('João', 'N').status).toBe('N')
  })
})
