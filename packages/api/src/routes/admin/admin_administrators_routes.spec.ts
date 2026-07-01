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
import { admin_administrators_routes } from '@/routes/admin/admin_administrators_routes'
import { Administrator } from '@/core/entities/administrator'
import { InMemoryAdministratorRepository } from '@/core/repositories/administrators/in-memory/in_memory_administrator_repository'

const ADMIN_ID = 'admin-001'
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
  await app.register(admin_administrators_routes)
  await app.ready()
  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@test.com' } },
    { expiresIn: '1h' },
  )
}

describe('admin_administrators_routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    adminRepo = new InMemoryAdministratorRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /admin/administradores', () => {
    it('returns 200 with paginated list', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/administradores',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toEqual([])
    })

    it('returns 401 without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/administradores' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /admin/administradores', () => {
    it('creates an administrator and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/administradores',
        cookies: { admin_token: token },
        payload: {
          nome_completo: 'Novo Admin',
          email: 'novo@test.com',
          senha: 'senha12345',
        },
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().nome_completo).toBe('Novo Admin')
    })
  })

  describe('GET /admin/administradores/:id', () => {
    it('returns 404 for unknown administrator', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/administradores/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns the administrator when found', async () => {
      const hashed = await bcrypt.hash('senha123', 1)
      adminRepo.seed(
        new Administrator({ id: 'a-1', nome_completo: 'Admin Teste', email: 'a@b.com', senha: hashed }),
      )
      const res = await app.inject({
        method: 'GET',
        url: '/admin/administradores/a-1',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe('a-1')
    })
  })

  describe('PUT /admin/administradores/:id', () => {
    it('returns 404 for unknown administrator', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/admin/administradores/non-existent',
        cookies: { admin_token: token },
        payload: { nome_completo: 'Nome Longo Suficiente' },
      })
      expect(res.statusCode).toBe(404)
    })

    it('updates and returns 200', async () => {
      const hashed = await bcrypt.hash('senha123', 1)
      adminRepo.seed(
        new Administrator({ id: 'a-1', nome_completo: 'Admin Velho', email: 'a@b.com', senha: hashed }),
      )
      const res = await app.inject({
        method: 'PUT',
        url: '/admin/administradores/a-1',
        cookies: { admin_token: token },
        payload: { nome_completo: 'Admin Novo' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().nome_completo).toBe('Admin Novo')
    })
  })

  describe('DELETE /admin/administradores/:id', () => {
    it('returns 404 for unknown administrator', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/admin/administradores/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('deletes and returns 204', async () => {
      const hashed = await bcrypt.hash('senha123', 1)
      adminRepo.seed(
        new Administrator({ id: 'a-1', nome_completo: 'Admin', email: 'a@b.com', senha: hashed }),
      )
      const res = await app.inject({
        method: 'DELETE',
        url: '/admin/administradores/a-1',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(204)
    })
  })
})
