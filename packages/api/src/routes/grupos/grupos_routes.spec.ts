import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifyJwt } from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import authPlugin from '@/plugins/auth-plugin'
import { grupos_routes } from '@/routes/grupos/grupos_routes'
import { InMemoryGrupoRepository } from '@/db/repositories/grupos/in-memory/in_memory_grupo_repository'

const HOTEL_ID = 'hotel-001'
const USER_ID = 'user-001'
const TEST_SECRET = 'test-jwt-secret'

let grupoRepo: InMemoryGrupoRepository

vi.mock('@/db/client', () => ({ db: {} }))

vi.mock('@/db/repositories/grupos/implementation/postgres_grupo_repository', () => ({
  PostgresGrupoRepository: vi.fn(function () {
    return grupoRepo
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
  await app.register(grupos_routes)
  await app.ready()

  return app
}

function make_token(app: FastifyInstance) {
  return app.jwt.sign(
    { sub: USER_ID, user: { hotelId: HOTEL_ID, nomecompleto: 'Admin', email: 'a@b.com' } },
    { expiresIn: '1h' },
  )
}

describe('grupos_routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    grupoRepo = new InMemoryGrupoRepository()
    app = await build_app()
    token = make_token(app)
  })

  describe('GET /grupos', () => {
    it('returns 200 with paginated empty list', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/grupos',
        cookies: { token },
      })
      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data).toEqual([])
      expect(body.meta.total).toBe(0)
    })

    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/grupos' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /grupos', () => {
    it('creates a grupo and returns 201', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/grupos',
        cookies: { token },
        payload: { grupo: 'Recepcionista', descricao: 'Acesso à recepção', status: 'S' },
      })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.grupo).toBe('Recepcionista')
      expect(body.hotel_id).toBe(HOTEL_ID)
    })
  })

  describe('GET /grupos/:id', () => {
    it('returns grupo by id', async () => {
      const g = await grupoRepo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
      const res = await app.inject({
        method: 'GET',
        url: `/grupos/${g.id}`,
        cookies: { token },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(g.id)
    })

    it('returns 404 when not found', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/grupos/missing',
        cookies: { token },
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('PUT /grupos/:id', () => {
    it('updates a grupo', async () => {
      const g = await grupoRepo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
      const res = await app.inject({
        method: 'PUT',
        url: `/grupos/${g.id}`,
        cookies: { token },
        payload: { grupo: 'G1 Atualizado' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().grupo).toBe('G1 Atualizado')
    })
  })

  describe('DELETE /grupos/:id', () => {
    it('deletes a grupo and returns 204', async () => {
      const g = await grupoRepo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
      const res = await app.inject({
        method: 'DELETE',
        url: `/grupos/${g.id}`,
        cookies: { token },
      })
      expect(res.statusCode).toBe(204)
    })

    it('returns 409 when grupo has linked users', async () => {
      const g = await grupoRepo.create({ hotel_id: HOTEL_ID, grupo: 'G1' })
      grupoRepo.setLinkedUsers(g.id, true)
      const res = await app.inject({
        method: 'DELETE',
        url: `/grupos/${g.id}`,
        cookies: { token },
      })
      expect(res.statusCode).toBe(409)
    })
  })
})
