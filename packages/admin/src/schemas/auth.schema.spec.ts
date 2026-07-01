import { describe, it, expect } from 'vitest'
import { login_schema } from './auth.schema'

describe('login_schema', () => {
  it('accepts a valid e-mail and password', () => {
    const result = login_schema.safeParse({
      email: 'admin@hotelmind.com.br',
      password: 'senha1234',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid e-mail', () => {
    const result = login_schema.safeParse({ email: 'not-an-email', password: 'senha1234' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('email')
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = login_schema.safeParse({ email: 'admin@test.com', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('password')
    }
  })

  it('rejects missing fields', () => {
    const result = login_schema.safeParse({})
    expect(result.success).toBe(false)
  })
})
