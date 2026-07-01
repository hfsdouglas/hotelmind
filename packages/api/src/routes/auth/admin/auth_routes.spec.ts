import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifyJwt } from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import adminAuthPlugin from '@/plugins/admin_auth_plugin'
import { admin_auth_routes } from '@/routes/auth/admin/auth_routes'
import { Administrator } from '@/core/entities/administrator'
import { InMemoryAdministratorRepository } from '@/core/repositories/administrators/in-memory/in_memory_administrator_repository'

const ADMIN_ID = 'admin-001'
const PLAIN_PASSWORD = 'senha123'
const TEST_SECRET = 'test-jwt-secret'

let adminRepo: InMemoryAdministratorRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock('@/core/repositories/administrators/implementation/postgres_administrator_repository', () => ({
  PostgresAdministratorRepository: vi.fn(function () {
    return adminRepo
  }),
}))

async function build_app(): Promise<FastifyInstance> {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  await app.register(fastifyCookie)
  await app.register(fastifyJwt, { secret: TEST_SECRET, cookie: { cookieName: 'admin_token', signed: false } })
  await app.register(adminAuthPlugin)
  await app.register(admin_auth_routes)
  await app.ready()
  return app
}

describe('admin auth_routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    adminRepo = new InMemoryAdministratorRepository()
    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10)
    adminRepo.seed(
      new Administrator({
        id: ADMIN_ID,
        nome_completo: 'Super Admin',
        email: 'super@hotelmind.com',
        senha: hashed,
      }),
    )
    app = await build_app()
  })

  describe('POST /admin/auth/login', () => {
    it('returns 200 and sets admin_token cookie on valid credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'super@hotelmind.com', password: PLAIN_PASSWORD },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().admin.id).toBe(ADMIN_ID)
      expect(res.cookies.some(c => c.name === 'admin_token')).toBe(true)
    })

    it('returns 401 on wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'super@hotelmind.com', password: 'wrongpassword' },
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns 401 on unknown email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'ghost@example.com', password: PLAIN_PASSWORD },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /admin/auth/me', () => {
    it('returns 200 with admin info when authenticated', async () => {
      const token = app.jwt.sign(
        { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@hotelmind.com' } },
        { expiresIn: '1h' },
      )
      const res = await app.inject({
        method: 'GET',
        url: '/admin/auth/me',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().admin.id).toBe(ADMIN_ID)
    })

    it('returns 401 without cookie', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/auth/me' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /admin/auth/logout', () => {
    it('returns 200 and clears admin_token cookie', async () => {
      const token = app.jwt.sign(
        { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@hotelmind.com' } },
        { expiresIn: '1h' },
      )
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/logout',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      const cleared = res.cookies.find(c => c.name === 'admin_token')
      expect(cleared?.maxAge).toBe(0)
    })

    it('returns 401 without cookie', async () => {
      const res = await app.inject({ method: 'POST', url: '/admin/auth/logout' })
      expect(res.statusCode).toBe(401)
    })
  })
})
