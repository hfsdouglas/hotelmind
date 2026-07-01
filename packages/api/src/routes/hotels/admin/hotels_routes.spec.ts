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
import { admin_hotels_routes } from '@/routes/hotels/admin/hotels_routes'
import { InMemoryHotelRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_repository'
import { InMemoryRouteRepository } from '@/core/repositories/routes/in-memory/in_memory_route_repository'

const ADMIN_ID = 'admin-001'
const TEST_SECRET = 'test-jwt-secret'

let hotelRepo: InMemoryHotelRepository
let routeRepo: InMemoryRouteRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock('@/core/repositories/hotels/implementation/postgres_hotel_repository', () => ({
  PostgresHotelRepository: vi.fn(function () {
    return hotelRepo
  }),
}))

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
  await app.register(admin_hotels_routes)
  await app.ready()
  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@test.com' } },
    { expiresIn: '1h' },
  )
}

const BASE_HOTEL = {
  nome_hotel: 'HotelMind',
  razao_social: 'HotelMind Ltda',
  nome_fantasia: 'HotelMind',
  cnpj: '00000000000000',
  email_comercial: 'contato@hotelmind.com.br',
  telefone_comercial: '11999999999',
}

describe('hotels_routes (admin)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    hotelRepo = new InMemoryHotelRepository()
    routeRepo = new InMemoryRouteRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /admin/hoteis', () => {
    it('returns 200 with paginated list', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/hoteis', cookies: { admin_token: token } })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toEqual([])
    })

    it('returns 401 without token', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/hoteis' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /admin/hoteis', () => {
    it('creates a hotel and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/hoteis',
        cookies: { admin_token: token },
        payload: BASE_HOTEL,
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().nome_hotel).toBe('HotelMind')
    })
  })

  describe('GET /admin/hoteis/:id', () => {
    it('returns 404 for unknown hotel', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/hoteis/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns hotel when found', async () => {
      const hotel = await hotelRepo.create(BASE_HOTEL)
      const res = await app.inject({
        method: 'GET',
        url: `/admin/hoteis/${hotel.id}`,
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(hotel.id)
    })
  })

  describe('PUT /admin/hoteis/:id', () => {
    it('returns 404 for unknown hotel', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/admin/hoteis/non-existent',
        cookies: { admin_token: token },
        payload: { nome_hotel: 'Novo' },
      })
      expect(res.statusCode).toBe(404)
    })

    it('updates the hotel and returns 200', async () => {
      const hotel = await hotelRepo.create(BASE_HOTEL)
      const res = await app.inject({
        method: 'PUT',
        url: `/admin/hoteis/${hotel.id}`,
        cookies: { admin_token: token },
        payload: { nome_hotel: 'HotelMind Atualizado' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().nome_hotel).toBe('HotelMind Atualizado')
    })
  })

  describe('DELETE /admin/hoteis/:id', () => {
    it('returns 404 for unknown hotel', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/admin/hoteis/non-existent',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('deletes the hotel and returns 204', async () => {
      const hotel = await hotelRepo.create(BASE_HOTEL)
      const res = await app.inject({
        method: 'DELETE',
        url: `/admin/hoteis/${hotel.id}`,
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(204)
    })
  })

  describe('GET /admin/hoteis/:id/rotas', () => {
    it('returns 404 when hotel not found', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/hoteis/non-existent/rotas',
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns empty array when hotel has no routes', async () => {
      const hotel = await hotelRepo.create(BASE_HOTEL)
      const res = await app.inject({
        method: 'GET',
        url: `/admin/hoteis/${hotel.id}/rotas`,
        cookies: { admin_token: token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual([])
    })
  })

  describe('PUT /admin/hoteis/:id/rotas', () => {
    it('returns 404 when hotel not found', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/admin/hoteis/non-existent/rotas',
        cookies: { admin_token: token },
        payload: { rota_ids: [] },
      })
      expect(res.statusCode).toBe(404)
    })

    it('sets hotel routes and returns 204', async () => {
      const hotel = await hotelRepo.create(BASE_HOTEL)
      const rota = await routeRepo.create({ modulo: 'M', recurso: 'R', rota: '/r' })
      const res = await app.inject({
        method: 'PUT',
        url: `/admin/hoteis/${hotel.id}/rotas`,
        cookies: { admin_token: token },
        payload: { rota_ids: [rota.id] },
      })
      expect(res.statusCode).toBe(204)
    })
  })
})
