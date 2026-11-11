import fastifyCookie from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import authPlugin from '@/plugins/auth_plugin'
import { categorias_quartos_routes } from './categorias_quartos_routes'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'
const TEST_SECRET = 'test-jwt-secret'

vi.mock('@/lib/prisma', () => ({ db: {} }))

function make_token(app: FastifyInstance, hotel_id: string) {
  return app.jwt.sign(
    {
      sub: `user-${hotel_id}`,
      user: {
        hotelId: hotel_id,
        nomecompleto: 'Gestor Hotel',
        email: `gestor@${hotel_id}.com`,
      },
    },
    { expiresIn: '1h' }
  )
}

let repository: InMemoryCategoriaQuartoRepository

vi.mock(
  '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresCategoriaQuartoRepository: vi.fn(function () {
      return repository
    }),
  })
)

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
  await app.register(categorias_quartos_routes)
  await app.ready()
  return app
}

describe('Categorias de Quartos Routes', () => {
  let app: FastifyInstance
  let token_a: string
  let token_b: string

  async function create(token: string, nome: string) {
    return app.inject({
      method: 'POST',
      url: '/categorias_quartos',
      cookies: { token },
      payload: { nome },
    })
  }

  beforeEach(async () => {
    repository = new InMemoryCategoriaQuartoRepository()
    app = await build_app()
    token_a = make_token(app, HOTEL_A)
    token_b = make_token(app, HOTEL_B)
  })

  describe('autenticacao', () => {
    it.each([
      ['GET', '/categorias_quartos'],
      ['POST', '/categorias_quartos'],
      ['GET', '/categorias_quartos/x'],
      ['PUT', '/categorias_quartos/x'],
    ] as const)('retorna 401 em %s %s sem token', async (method, url) => {
      const res = await app.inject({ method, url })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /categorias_quartos', () => {
    it('cria categoria com status S por padrao e hotel_id do JWT', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/categorias_quartos',
        cookies: { token: token_a },
        payload: { nome: 'Luxo', hotel_id: HOTEL_B },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        nome: 'Luxo',
        status: 'S',
        hotel_id: HOTEL_A,
      })
    })

    it('retorna 400 quando o nome esta vazio', async () => {
      const res = await create(token_a, '   ')
      expect(res.statusCode).toBe(400)
    })

    it('retorna 400 quando o status e invalido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/categorias_quartos',
        cookies: { token: token_a },
        payload: { nome: 'Luxo', status: 'X' },
      })
      expect(res.statusCode).toBe(400)
    })

    it('retorna 409 para nome duplicado no mesmo hotel', async () => {
      await create(token_a, 'Luxo')
      const res = await create(token_a, 'luxo')
      expect(res.statusCode).toBe(409)
    })

    it('permite o mesmo nome em hoteis diferentes', async () => {
      await create(token_a, 'Luxo')
      const res = await create(token_b, 'Luxo')
      expect(res.statusCode).toBe(201)
    })
  })

  describe('GET /categorias_quartos', () => {
    it('lista apenas categorias do hotel autenticado', async () => {
      await create(token_a, 'Categoria A')
      await create(token_b, 'Categoria B')

      const res = await app.inject({
        method: 'GET',
        url: '/categorias_quartos',
        cookies: { token: token_a },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].nome).toBe('Categoria A')
      expect(body.meta).toMatchObject({ pagina: 1, limite: 50, total: 1 })
    })

    it('ignora hotel_id enviado na query', async () => {
      await create(token_b, 'Categoria B')
      const res = await app.inject({
        method: 'GET',
        url: '/categorias_quartos?hotel_id=hotel-b',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveLength(0)
    })

    it('retorna 400 quando limite excede 250', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/categorias_quartos?limite=251',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(400)
    })

    it('filtra por busca', async () => {
      await create(token_a, 'Luxo')
      await create(token_a, 'Standard')
      const res = await app.inject({
        method: 'GET',
        url: '/categorias_quartos?busca=lux',
        cookies: { token: token_a },
      })
      expect(res.json().data.map((c: { nome: string }) => c.nome)).toEqual([
        'Luxo',
      ])
    })
  })

  describe('GET /categorias_quartos/:id', () => {
    it('retorna a categoria do proprio hotel', async () => {
      const id = (await create(token_a, 'Luxo')).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(id)
    })

    it('retorna 404 para id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/categorias_quartos/inexistente',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 ao buscar categoria de outro hotel', async () => {
      const id = (await create(token_b, 'Luxo')).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('PUT /categorias_quartos/:id', () => {
    it('atualiza nome e status', async () => {
      const id = (await create(token_a, 'Luxo')).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_a },
        payload: { nome: 'Super Luxo', status: 'N' },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ nome: 'Super Luxo', status: 'N' })
    })

    it('retorna 400 quando status nao e informado', async () => {
      const id = (await create(token_a, 'Luxo')).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_a },
        payload: { nome: 'Luxo' },
      })
      expect(res.statusCode).toBe(400)
    })

    it('retorna 404 para id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/categorias_quartos/inexistente',
        cookies: { token: token_a },
        payload: { nome: 'X', status: 'S' },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 e nao altera categoria de outro hotel', async () => {
      const id = (await create(token_b, 'Luxo')).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_a },
        payload: { nome: 'Invadida', status: 'N' },
      })
      expect(res.statusCode).toBe(404)

      const check = await app.inject({
        method: 'GET',
        url: `/categorias_quartos/${id}`,
        cookies: { token: token_b },
      })
      expect(check.json()).toMatchObject({ nome: 'Luxo', status: 'S' })
    })
  })
})
