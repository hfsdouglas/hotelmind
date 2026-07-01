import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifyJwt } from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import adminAuthPlugin from '@/plugins/admin_auth_plugin'
import { admin_routes_routes } from '@/routes/routes/admin/routes_routes'
import { InMemoryRouteRepository } from '@/core/repositories/routes/in-memory/in_memory_route_repository'

const ADMIN_ID = 'admin-001'
const TEST_SECRET = 'test-jwt-secret'

let routeRepo: InMemoryRouteRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock('@/core/repositories/routes/implementation/postgres_route_repository', () => ({
  PostgresRouteRepository: vi.fn(function () {
    return routeRepo
  }),
}))

async function build_app(): Promise<FastifyInstance> {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  await app.register(fastifyCookie)
  await app.register(fastifyJwt, { secret: TEST_SECRET, cookie: { cookieName: 'admin_token', signed: false } })
  await app.register(adminAuthPlugin)
  await app.register(admin_routes_routes)
  await app.ready()
  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@test.com' } },
    { expiresIn: '1h' },
  )
}

const BASE_ROUTE = {
  modulo: 'Dashboard',
  recurso: 'Visão Geral',
  rota: '/dashboard',
  ordem: 1,
  ativo: true,
}

describe('routes_routes (admin)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    routeRepo = new InMemoryRouteRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /admin/rotas', () => {
    it('returns 200 with paginated list', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/rotas', cookies: { admin_token: token } })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toEqual([])
    })

    it('returns 401 without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/rotas' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /admin/rotas', () => {
    it('creates a route and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/rotas',
        cookies: { admin_token: token },
        payload: BASE_ROUTE,
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().rota).toBe('/dashboard')
    })
  })

  describe('GET /admin/rotas/:id', () => {
    it('returns 404 for unknown route', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/rotas/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns the route when found', async () => {
      const rota = await routeRepo.create(BASE_ROUTE)
      const res = await app.inject({
        method: 'GET',
        url: `/admin/rotas/${rota.id}`,
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(rota.id)
    })
  })

  describe('PUT /admin/rotas/:id', () => {
    it('returns 404 for unknown route', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/admin/rotas/non-existent',
        cookies: { admin_token: token },
        payload: { modulo: 'Novo' },
      })
      expect(res.statusCode).toBe(404)
    })

    it('updates the route and returns 200', async () => {
      const rota = await routeRepo.create(BASE_ROUTE)
      const res = await app.inject({
        method: 'PUT',
        url: `/admin/rotas/${rota.id}`,
        cookies: { admin_token: token },
        payload: { modulo: 'Relatórios' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().modulo).toBe('Relatórios')
    })
  })

  describe('DELETE /admin/rotas/:id', () => {
    it('returns 404 for unknown route', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/admin/rotas/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('deletes the route and returns 204', async () => {
      const rota = await routeRepo.create(BASE_ROUTE)
      const res = await app.inject({
        method: 'DELETE',
        url: `/admin/rotas/${rota.id}`,
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(204)
    })
  })
})
