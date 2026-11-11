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
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import authPlugin from '@/plugins/auth_plugin'
import { quartos_routes } from './quartos_routes'

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

let quartos_repository: InMemoryQuartoRepository
let categorias_repository: InMemoryCategoriaQuartoRepository

vi.mock(
  '@/core/repositories/quartos/implementation/postgres_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresQuartoRepository: vi.fn(function () {
      return quartos_repository
    }),
  })
)

vi.mock(
  '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresCategoriaQuartoRepository: vi.fn(function () {
      return categorias_repository
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
  await app.register(quartos_routes)
  await app.ready()
  return app
}

describe('Quartos Routes', () => {
  let app: FastifyInstance
  let token_a: string
  let token_b: string

  async function make_categoria(
    hotel_id: string,
    status: 'S' | 'N' = 'S'
  ): Promise<string> {
    const category = await categorias_repository.create({
      hotel_id,
      nome: `Categoria ${hotel_id} ${Math.random()}`,
      status,
    })
    return category.id
  }

  const body = (categoria_id: string, over: Record<string, unknown> = {}) => ({
    categoria_id,
    identificacao: '101',
    descricao: 'Vista mar',
    limite_hospedes: 2,
    camas: [{ tipo: 'casal', quantidade: 1 }],
    ...over,
  })

  async function create(
    token: string,
    categoria_id: string,
    over: Record<string, unknown> = {}
  ) {
    return app.inject({
      method: 'POST',
      url: '/quartos',
      cookies: { token },
      payload: body(categoria_id, over),
    })
  }

  beforeEach(async () => {
    quartos_repository = new InMemoryQuartoRepository()
    categorias_repository = new InMemoryCategoriaQuartoRepository()
    app = await build_app()
    token_a = make_token(app, HOTEL_A)
    token_b = make_token(app, HOTEL_B)
  })

  it.each([
    ['GET', '/quartos'],
    ['POST', '/quartos'],
    ['GET', '/quartos/x'],
    ['PUT', '/quartos/x'],
  ] as const)('retorna 401 em %s %s sem token', async (method, url) => {
    const res = await app.inject({ method, url })
    expect(res.statusCode).toBe(401)
  })

  describe('POST /quartos', () => {
    it('cria quarto com hotel_id do JWT e ignora hotel_id do body', async () => {
      const categoria_id = await make_categoria(HOTEL_A)
      const res = await create(token_a, categoria_id, { hotel_id: HOTEL_B })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        hotel_id: HOTEL_A,
        identificacao: '101',
        limite_hospedes: 2,
        status: 'S',
      })
      expect(res.json().camas).toHaveLength(1)
    })

    it.each([
      ['identificacao nao numerica', { identificacao: 'A1' }],
      ['limite_hospedes zero', { limite_hospedes: 0 }],
      ['sem camas', { camas: [] }],
      [
        'tipo de cama duplicado',
        {
          camas: [
            { tipo: 'casal', quantidade: 1 },
            { tipo: 'casal', quantidade: 2 },
          ],
        },
      ],
      ['tipo de cama invalido', { camas: [{ tipo: 'rede', quantidade: 1 }] }],
    ])('retorna 400 com %s', async (_label, over) => {
      const categoria_id = await make_categoria(HOTEL_A)
      const res = await create(token_a, categoria_id, over)
      expect(res.statusCode).toBe(400)
    })

    it('retorna 404 quando a categoria esta inativa', async () => {
      const categoria_id = await make_categoria(HOTEL_A, 'N')
      const res = await create(token_a, categoria_id)
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 quando a categoria nao existe', async () => {
      const res = await create(token_a, 'inexistente')
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 ao usar categoria de outro hotel', async () => {
      const categoria_b = await make_categoria(HOTEL_B)
      const res = await create(token_a, categoria_b)
      expect(res.statusCode).toBe(404)
      expect(quartos_repository.items).toHaveLength(0)
    })

    it('retorna 409 quando o repositorio sinaliza violacao de unicidade', async () => {
      const categoria_id = await make_categoria(HOTEL_A)
      vi.spyOn(quartos_repository, 'create').mockRejectedValueOnce({
        code: 'P2002',
      })
      const res = await create(token_a, categoria_id)
      expect(res.statusCode).toBe(409)
    })
  })

  describe('GET /quartos', () => {
    it('lista apenas quartos do hotel autenticado', async () => {
      const cat_a = await make_categoria(HOTEL_A)
      const cat_b = await make_categoria(HOTEL_B)
      await create(token_a, cat_a, { identificacao: '101' })
      await create(token_b, cat_b, { identificacao: '202' })

      const res = await app.inject({
        method: 'GET',
        url: '/quartos',
        cookies: { token: token_a },
      })

      expect(res.statusCode).toBe(200)
      const json = res.json()
      expect(json.data).toHaveLength(1)
      expect(json.data[0].identificacao).toBe('101')
      expect(json.meta).toMatchObject({ pagina: 1, limite: 25, total: 1 })
    })

    it('ignora hotel_id enviado na query', async () => {
      const cat_b = await make_categoria(HOTEL_B)
      await create(token_b, cat_b)
      const res = await app.inject({
        method: 'GET',
        url: '/quartos?hotel_id=hotel-b',
        cookies: { token: token_a },
      })
      expect(res.json().data).toHaveLength(0)
    })

    it('filtra por busca e por categoria_id', async () => {
      const cat_1 = await make_categoria(HOTEL_A)
      const cat_2 = await make_categoria(HOTEL_A)
      await create(token_a, cat_1, { identificacao: '101' })
      await create(token_a, cat_2, { identificacao: '202' })

      const por_busca = await app.inject({
        method: 'GET',
        url: '/quartos?busca=202',
        cookies: { token: token_a },
      })
      expect(por_busca.json().data).toHaveLength(1)

      const por_categoria = await app.inject({
        method: 'GET',
        url: `/quartos?categoria_id=${cat_1}`,
        cookies: { token: token_a },
      })
      expect(
        por_categoria
          .json()
          .data.map((r: { identificacao: string }) => r.identificacao)
      ).toEqual(['101'])
    })

    it.each([
      'limite=10',
      'limite=251',
      'pagina=0',
      'status=X',
    ])('retorna 400 com query invalida %s', async query => {
      const res = await app.inject({
        method: 'GET',
        url: `/quartos?${query}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /quartos/:id', () => {
    it('retorna o quarto do proprio hotel', async () => {
      const cat = await make_categoria(HOTEL_A)
      const id = (await create(token_a, cat)).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().id).toBe(id)
    })

    it('retorna 404 para id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/quartos/inexistente',
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 ao buscar quarto de outro hotel', async () => {
      const cat_b = await make_categoria(HOTEL_B)
      const id = (await create(token_b, cat_b)).json().id
      const res = await app.inject({
        method: 'GET',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('PUT /quartos/:id', () => {
    const update_body = (categoria_id: string, over = {}) => ({
      ...body(categoria_id, { identificacao: '102', limite_hospedes: 3 }),
      status: 'N',
      ...over,
    })

    it('atualiza o quarto', async () => {
      const cat = await make_categoria(HOTEL_A)
      const id = (await create(token_a, cat)).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
        payload: update_body(cat),
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({
        identificacao: '102',
        limite_hospedes: 3,
        status: 'N',
      })
    })

    it('retorna 400 quando status nao e informado', async () => {
      const cat = await make_categoria(HOTEL_A)
      const id = (await create(token_a, cat)).json().id
      const { status: _status, ...sem_status } = update_body(cat)
      const res = await app.inject({
        method: 'PUT',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
        payload: sem_status,
      })
      expect(res.statusCode).toBe(400)
    })

    it('retorna 404 para quarto inexistente', async () => {
      const cat = await make_categoria(HOTEL_A)
      const res = await app.inject({
        method: 'PUT',
        url: '/quartos/inexistente',
        cookies: { token: token_a },
        payload: update_body(cat),
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 404 quando a nova categoria esta inativa', async () => {
      const cat = await make_categoria(HOTEL_A)
      const inativa = await make_categoria(HOTEL_A, 'N')
      const id = (await create(token_a, cat)).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
        payload: update_body(inativa),
      })
      expect(res.statusCode).toBe(404)
    })

    it('retorna 409 quando o repositorio sinaliza violacao de unicidade', async () => {
      const cat = await make_categoria(HOTEL_A)
      const id = (await create(token_a, cat)).json().id
      vi.spyOn(quartos_repository, 'update').mockRejectedValueOnce({
        code: 'P2002',
      })
      const res = await app.inject({
        method: 'PUT',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
        payload: update_body(cat),
      })
      expect(res.statusCode).toBe(409)
    })

    it('retorna 404 e nao altera quarto de outro hotel', async () => {
      const cat_a = await make_categoria(HOTEL_A)
      const cat_b = await make_categoria(HOTEL_B)
      const id = (await create(token_b, cat_b)).json().id
      const res = await app.inject({
        method: 'PUT',
        url: `/quartos/${id}`,
        cookies: { token: token_a },
        payload: update_body(cat_a),
      })
      expect(res.statusCode).toBe(404)

      const check = await app.inject({
        method: 'GET',
        url: `/quartos/${id}`,
        cookies: { token: token_b },
      })
      expect(check.json()).toMatchObject({ identificacao: '101', status: 'S' })
    })
  })
})
