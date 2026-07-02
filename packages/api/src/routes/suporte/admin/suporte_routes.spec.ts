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
import { admin_suporte_routes } from '@/routes/suporte/admin/suporte_routes'
import { InMemoryHotelRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_repository'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'
import { InMemoryRouteRepository } from '@/core/repositories/routes/in-memory/in_memory_route_repository'

const ADMIN_ID = 'admin-001'
const TEST_SECRET = 'test-jwt-secret'

let hotelRepo: InMemoryHotelRepository
let userRepo: InMemoryUserRepository
let routeRepo: InMemoryRouteRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock('@/core/repositories/hotels/implementation/postgres_hotel_repository', () => ({
  PostgresHotelRepository: vi.fn(function () {
    return hotelRepo
  }),
}))

vi.mock('@/core/repositories/users/implementation/postgres_user_repository', () => ({
  PostgresUserRepository: vi.fn(function () {
    return userRepo
  }),
}))

vi.mock('@/core/repositories/routes/implementation/postgres_route_repository', () => ({
  PostgresRouteRepository: vi.fn(function () {
    return routeRepo
  }),
}))

vi.mock('@/config/env', () => ({
  WEB_APP_URL: 'http://localhost:5173',
}))

async function build_app(): Promise<FastifyInstance> {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  await app.register(fastifyCookie)
  await app.register(fastifyJwt, { secret: TEST_SECRET, cookie: { cookieName: 'admin_token', signed: false } })
  await app.register(adminAuthPlugin)
  await app.register(admin_suporte_routes)
  await app.ready()
  return app
}

function make_admin_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: ADMIN_ID, role: 'admin', admin: { nomecompleto: 'Super Admin', email: 'super@test.com' } },
    { expiresIn: '1h' },
  )
}

const HOTEL_DATA = {
  nome_hotel: 'HotelMind',
  razao_social: 'HotelMind Ltda',
  nome_fantasia: 'HotelMind',
  cnpj: '00000000000000',
  email_comercial: 'contato@hotelmind.com.br',
  telefone_comercial: '11999999999',
}

const USER_DATA = {
  nome_completo: 'Douglas Faria',
  email: 'douglas@hotelmind.com.br',
  senha: 'hashed',
  nascimento: new Date('1990-01-01'),
  genero: 'M',
  celular: '11988887777',
  cpf: '11122233344',
}

describe('suporte_routes (admin)', () => {
  let app: FastifyInstance
  let adminToken: string

  beforeEach(async () => {
    hotelRepo = new InMemoryHotelRepository()
    userRepo = new InMemoryUserRepository()
    routeRepo = new InMemoryRouteRepository()
    app = await build_app()
    adminToken = make_admin_token(app)
  })

  describe('GET /admin/hoteis/:id/suporte-acesso', () => {
    it('returns 401 without an admin session', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/hoteis/any/suporte-acesso?usuario_id=any' })
      expect(res.statusCode).toBe(401)
    })

    it('redirects to WEB_APP_URL and sets a token cookie with a suporte claim on success', async () => {
      const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'S' })
      const user = await userRepo.create({ ...USER_DATA, hotel_id: hotel.id })

      const res = await app.inject({
        method: 'GET',
        url: `/admin/hoteis/${hotel.id}/suporte-acesso?usuario_id=${user.id}`,
        cookies: { admin_token: adminToken },
      })

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toBe('http://localhost:5173')

      const set_cookie = res.cookies.find(c => c.name === 'token')
      expect(set_cookie).toBeDefined()

      const decoded = app.jwt.decode<{ suporte?: { administratorId: string } }>(set_cookie!.value)
      expect(decoded?.suporte?.administratorId).toBe(ADMIN_ID)
    })

    it('returns 404 HTML when the hotel does not exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/hoteis/non-existent/suporte-acesso?usuario_id=any',
        cookies: { admin_token: adminToken },
      })
      expect(res.statusCode).toBe(404)
      expect(res.headers['content-type']).toContain('text/html')
    })

    it('returns 409 HTML when the hotel is inactive', async () => {
      const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'N' })
      const user = await userRepo.create({ ...USER_DATA, hotel_id: hotel.id })

      const res = await app.inject({
        method: 'GET',
        url: `/admin/hoteis/${hotel.id}/suporte-acesso?usuario_id=${user.id}`,
        cookies: { admin_token: adminToken },
      })
      expect(res.statusCode).toBe(409)
      expect(res.headers['content-type']).toContain('text/html')
    })

    it('returns 404 HTML when the user does not belong to the hotel', async () => {
      const hotel = await hotelRepo.create({ ...HOTEL_DATA, status: 'S' })

      const res = await app.inject({
        method: 'GET',
        url: `/admin/hoteis/${hotel.id}/suporte-acesso?usuario_id=ghost`,
        cookies: { admin_token: adminToken },
      })
      expect(res.statusCode).toBe(404)
      expect(res.headers['content-type']).toContain('text/html')
    })
  })
})
