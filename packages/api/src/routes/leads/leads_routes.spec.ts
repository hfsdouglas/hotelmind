import fastifyCookie from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryLeadRepository } from '@/core/repositories/leads/in-memory/in_memory_lead_repository'
import authPlugin from '@/plugins/auth_plugin'
import { leads_routes } from './leads_routes'

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

let repository: InMemoryLeadRepository

vi.mock(
  '@/core/repositories/leads/implementation/postgres_lead_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresLeadRepository: vi.fn(function () {
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
  await app.register(leads_routes)
  await app.ready()
  return app
}

const valid_lead = (over: Record<string, unknown> = {}) => ({
  nome: 'Maria Silva',
  telefone: '11999990000',
  email: 'maria@example.com',
  ...over,
})

describe('Leads Routes', () => {
  let app: FastifyInstance
  let token_a: string
  let token_b: string

  async function create(token: string, over: Record<string, unknown> = {}) {
    return app.inject({
      method: 'POST',
      url: '/leads',
      cookies: { token },
      payload: valid_lead(over),
    })
  }

  beforeEach(async () => {
    repository = new InMemoryLeadRepository()
    app = await build_app()
    token_a = make_token(app, HOTEL_A)
    token_b = make_token(app, HOTEL_B)
  })

  it.each([
    ['GET', '/leads'],
    ['POST', '/leads'],
    ['GET', '/leads/7f9c24e8-3b1a-4c55-9d1e-0a1b2c3d4e5f'],
  ] as const)('retorna 401 em %s %s sem token', async (method, url) => {
    const res = await app.inject({ method, url })
    expect(res.statusCode).toBe(401)
  })

  describe('POST /leads', () => {
    it('cria lead com hotel_id vindo do JWT e ignora hotel_id do body', async () => {
      const res = await create(token_a, { hotel_id: HOTEL_B })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        nome: 'Maria Silva',
        email: 'maria@example.com',
        hotel_id: HOTEL_A,
      })
      expect(typeof res.json().criado_em).toBe('string')
    })

    it.each([
      ['nome vazio', { nome: '  ' }],
      ['telefone vazio', { telefone: '' }],
      ['email invalido', { email: 'nao-e-email' }],
    ])('retorna 400 com %s', async (_label, over) => {
      const res = await create(token_a, over)
      expect(res.statusCode).toBe(400)
    })

    it('retorna 400 quando campos obrigatorios estao ausentes', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/leads',
        cookies: { token: token_a },
        payload: {},
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /leads', () => {
    it('lista apenas leads do hotel autenticado com meta de paginacao', async () => {
      await create(token_a, { nome: 'Lead A', email: 'a@a.com' })
      await create(token_b, { nome: 'Lead B', email: 'b@b.com' })

      const res = await app.inject({
        method: 'GET',
        url: '/leads',
        cookies: { token: token_a },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].nome).toBe('Lead A')
      expect(body.meta).toEqual({
        total: 1,
        pagina: 1,
        limite: 25,
        ultima_pagina: 1,
      })
    })

    it('ignora hotel_id enviado na query', async () => {
      await create(token_b)
      const res = await app.inject({
        method: 'GET',
        url: '/leads?hotel_id=hotel-b',
        cookies: { token: token_a },
      })
      expect(res.json().data).toHaveLength(0)
    })

    it('filtra por busca', async () => {
      await create(token_a, { nome: 'Maria', email: 'm@x.com' })
      await create(token_a, { nome: 'Joao', email: 'j@x.com' })
      const res = await app.inject({
        method: 'GET',
        url: '/leads?busca=joao',
        cookies: { token: token_a },
      })
      expect(res.json().data.map((l: { nome: string }) => l.nome)).toEqual([
        'Joao',
      ])
    })

    it('pagina os resultados', async () => {
      await create(token_a, { nome: 'L1', email: '1@x.com', telefone: '1' })
      await create(token_a, { nome: 'L2', email: '2@x.com', telefone: '2' })
      const res = await app.inject({
        method: 'GET',
        url: '/leads?pagina=2&limite=1',
        cookies: { token: token_a },
      })
      const body = res.json()
      expect(body.data).toHaveLength(1)
      expect(body.meta).toMatchObject({
        pagina: 2,
        limite: 1,
        total: 2,
        ultima_pagina: 2,
      })
    })

    it.each([
      'limite=251',
      'limite=0',
      'pagina=0',
    ])('retorna 400 com query invalida %s', async query => {
      const res = await app.inject({
        method: 'GET',
        url: `/leads?${query}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /leads/:id', () => {
    it('retorna o lead do proprio hotel', async () => {
      const id = (await create(token_a)).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/leads/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(id)
    })

    it('retorna 400 quando o id nao e UUID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/leads/abc',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(400)
    })

    it('retorna 404 para UUID inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/leads/7f9c24e8-3b1a-4c55-9d1e-0a1b2c3d4e5f',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 ao buscar lead de outro hotel', async () => {
      const id = (await create(token_b)).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/leads/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
