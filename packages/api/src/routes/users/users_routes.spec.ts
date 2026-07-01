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
import { users_routes } from '@/routes/users/users_routes'
import { InMemoryUserRepository } from '@/core/repositories/users/in-memory/in_memory_user_repository'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'
const TEST_SECRET = 'test-jwt-secret'

let userRepo: InMemoryUserRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock('@/core/repositories/users/implementation/postgres_user_repository', () => ({
  PostgresUserRepository: vi.fn(function () {
    return userRepo
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
  await app.register(users_routes)
  await app.ready()
  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: USER_ID, user: { hotelId: HOTEL_ID, nomecompleto: 'Test', email: 't@t.com' } },
    { expiresIn: '1h' },
  )
}

const BASE_PAYLOAD = {
  nome_completo: 'João Silva',
  email: 'joao@test.com',
  senha: 'senha12345',
  nascimento: '1990-01-01',
  genero: 'Masculino',
  celular: '11999999999',
  cpf: '12345678901',
}

describe('users_routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /usuarios', () => {
    it('returns 200 with paginated empty list', async () => {
      const res = await app.inject({ method: 'GET', url: '/usuarios', cookies: { token } })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toEqual([])
      expect(res.json().meta.total).toBe(0)
    })

    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/usuarios' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /usuarios', () => {
    it('creates a user and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/usuarios',
        cookies: { token },
        payload: BASE_PAYLOAD,
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().email).toBe('joao@test.com')
      expect(res.json().hotel_id).toBe(HOTEL_ID)
    })

    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'POST', url: '/usuarios', payload: BASE_PAYLOAD })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /usuarios/:id', () => {
    it('returns 404 for unknown user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/usuarios/non-existent',
        cookies: { token },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns the user when found', async () => {
      const user = await userRepo.create({ ...BASE_PAYLOAD, hotel_id: HOTEL_ID, nascimento: new Date('1990-01-01') })
      const res = await app.inject({
        method: 'GET',
        url: `/usuarios/${user.id}`,
        cookies: { token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(user.id)
    })
  })

  describe('PUT /usuarios/:id', () => {
    it('returns 404 for unknown user', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/usuarios/non-existent',
        cookies: { token },
        payload: { nome_completo: 'Novo Nome' },
      })
      expect(res.statusCode).toBe(404)
    })

    it('updates the user and returns 200', async () => {
      const user = await userRepo.create({ ...BASE_PAYLOAD, hotel_id: HOTEL_ID, nascimento: new Date('1990-01-01') })
      const res = await app.inject({
        method: 'PUT',
        url: `/usuarios/${user.id}`,
        cookies: { token },
        payload: { nome_completo: 'Nome Atualizado' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().nome_completo).toBe('Nome Atualizado')
    })
  })
})
