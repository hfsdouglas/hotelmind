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
import authPlugin from '@/plugins/auth-plugin'
import { auth_routes } from '@/routes/auth/auth_routes'
import { User } from '@/core/entities/user'
import { Hotel } from '@/core/entities/hotel'
import { InMemoryUserRepository } from '@/db/repositories/users/in-memory/in_memory_user_repository'
import { InMemoryHotelRepository } from '@/db/repositories/hotels/in-memory/in_memory_hotel_repository'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'
const PLAIN_PASSWORD = 'senha123'
const TEST_SECRET = 'test-jwt-secret'

let userRepo: InMemoryUserRepository
let hotelRepo: InMemoryHotelRepository

vi.mock('@/db/client', () => ({ db: {} }))

// Regular functions required — arrow functions cannot be used as constructors
vi.mock('@/db/repositories', () => ({
  UserRepository: vi.fn(function () { return userRepo }),
  HotelRepository: vi.fn(function () { return hotelRepo }),
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
  await app.register(auth_routes)
  await app.ready()

  return app
}

describe('auth_routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    hotelRepo = new InMemoryHotelRepository()
    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10)

    hotelRepo.seed(
      new Hotel({
        id: HOTEL_ID,
        nome_hotel: 'HotelMind',
        nome_fantasia: 'HotelMind',
        razao_social: 'HotelMind Ltda',
        cnpj: '00000000000000',
        email_comercial: 'contato@hotelmind.com.br',
        telefone_comercial: '11999999999',
      }),
    )

    userRepo.seed(
      new User({
        id: USER_ID,
        hotel_id: HOTEL_ID,
        nome_completo: 'Admin HotelMind',
        email: 'admin@hotelmind.com.br',
        senha: hashed,
        nascimento: new Date('1990-01-01'),
        genero: 'Masculino',
        celular: '11999999999',
        cpf: '00000000000',
      }),
    )

    app = await build_app()
  })

  describe('POST /auth/login', () => {
    it('returns 200 with user and hotel on valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'admin@hotelmind.com.br', password: PLAIN_PASSWORD },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.user.id).toBe(USER_ID)
      expect(body.hotel.id).toBe(HOTEL_ID)
      expect(body.message).toBe('Bem-vindo!')
      expect(response.cookies.some((c) => c.name === 'token')).toBe(true)
    })

    it('returns 401 on wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'admin@hotelmind.com.br', password: 'wrongpassword' },
      })

      expect(response.statusCode).toBe(401)
      expect(response.json().message).toBe('Credenciais inválidas')
    })

    it('returns 401 when email is unknown', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'ghost@example.com', password: PLAIN_PASSWORD },
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /auth/me', () => {
    it('returns 200 with a valid JWT cookie', async () => {
      const token = app.jwt.sign(
        {
          sub: USER_ID,
          user: {
            hotelId: HOTEL_ID,
            nomecompleto: 'Admin HotelMind',
            email: 'admin@hotelmind.com.br',
          },
        },
        { expiresIn: '1h' },
      )

      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        cookies: { token },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ ok: true })
    })

    it('returns 401 without a cookie', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      })

      expect(response.statusCode).toBe(401)
    })
  })
})
