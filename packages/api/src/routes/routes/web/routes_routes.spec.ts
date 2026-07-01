import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifyJwt } from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import authPlugin from '@/plugins/auth_plugin'
import { routes_routes } from '@/routes/routes/web/routes_routes'
import { InMemoryRouteRepository } from '@/core/repositories/routes/in-memory/in_memory_route_repository'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'
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
  await app.register(fastifyJwt, {
    secret: TEST_SECRET,
    cookie: { cookieName: 'token', signed: false },
  })
  await app.register(authPlugin)
  await app.register(routes_routes)
  await app.ready()
  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: USER_ID, user: { hotelId: HOTEL_ID, nomecompleto: 'Test', email: 't@t.com' } },
    { expiresIn: '1h' },
  )
}

describe('routes_routes (web)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    routeRepo = new InMemoryRouteRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /rotas', () => {
    it('returns 200 with an empty array when no routes assigned', async () => {
      const res = await app.inject({ method: 'GET', url: '/rotas', cookies: { token } })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual([])
    })

    it('returns assigned routes for the hotel', async () => {
      const rota = await routeRepo.create({
        modulo: 'Dashboard',
        recurso: 'Visão Geral',
        rota: '/dashboard',
        ordem: 1,
        ativo: true,
      })
      await routeRepo.setHotelRoutes(HOTEL_ID, [rota.id])

      const res = await app.inject({ method: 'GET', url: '/rotas', cookies: { token } })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toHaveLength(1)
      expect(res.json()[0].rota).toBe('/dashboard')
    })

    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/rotas' })
      expect(res.statusCode).toBe(401)
    })
  })
})
