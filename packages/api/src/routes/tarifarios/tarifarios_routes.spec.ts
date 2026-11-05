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
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import authPlugin from '@/plugins/auth_plugin'
import { tarifarios_routes } from '@/routes/tarifarios/tarifarios_routes'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'
const REGIME_ID = '33333333-3333-4333-8333-333333333333'
const TEST_SECRET = 'test-jwt-secret'

let tarifario_repo: InMemoryTarifarioRepository
let categoria_repo: InMemoryCategoriaQuartoRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/tarifarios/implementation/postgres_tarifario_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function
    PostgresTarifarioRepository: vi.fn().mockImplementation(function () {
      return tarifario_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function
    PostgresCategoriaQuartoRepository: vi.fn().mockImplementation(function () {
      return categoria_repo
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
  await app.register(tarifarios_routes)
  await app.ready()

  return app
}

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

describe('tarifarios_routes', () => {
  let app: FastifyInstance
  let token_hotel_a: string
  let token_hotel_b: string
  let cat_a_id: string

  beforeEach(async () => {
    tarifario_repo = new InMemoryTarifarioRepository()
    categoria_repo = new InMemoryCategoriaQuartoRepository()
    const cat_a = await categoria_repo.create({
      hotel_id: HOTEL_A,
      nome: 'Suítes Luxo',
      status: 'S',
    })
    cat_a_id = cat_a.id
    tarifario_repo.register_category(cat_a.id, cat_a.nome, 'S')
    tarifario_repo.register_regime_alimentacao(
      REGIME_ID,
      'Meia Pensão',
      '#2563EB'
    )

    app = await build_app()
    token_hotel_a = make_token(app, HOTEL_A)
    token_hotel_b = make_token(app, HOTEL_B)
  })

  it('requires authentication on /tarifarios endpoints', async () => {
    const res = await app.inject({ method: 'GET', url: '/tarifarios' })
    expect(res.statusCode).toBe(401)
  })

  it('creates, lists, queries calendar, edits, deactivates, and reactivates rate plans with 409 conflict enforcement', async () => {
    const create_res = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_a },
      payload: {
        categoria_quarto_id: cat_a_id,
        regime_alimentacao_id: REGIME_ID,
        nome: 'Baixa temporada',
        datas: ['2027-03-01', '2027-03-05'],
        valor_diaria: '200.00',
        ativo: true,
      },
    })
    expect(create_res.statusCode).toBe(201)
    const created = create_res.json()
    expect(created.hotel_id).toBe(HOTEL_A)
    expect(created.valor_diaria).toBe('200.00')
    expect(created.datas).toEqual(['2027-03-01', '2027-03-05'])

    // 2. Overlapping date creation returns 409
    const conflict_res = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_a },
      payload: {
        categoria_quarto_id: cat_a_id,
        regime_alimentacao_id: REGIME_ID,
        nome: 'Sobreposição',
        datas: ['2027-03-05', '2027-03-10'],
        valor_diaria: '220.00',
      },
    })
    expect(conflict_res.statusCode).toBe(409)

    // 3. Non-overlapping dates creation returns 201
    const non_overlapping_res = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_a },
      payload: {
        categoria_quarto_id: cat_a_id,
        regime_alimentacao_id: REGIME_ID,
        nome: 'Outros dias de Março',
        datas: ['2027-03-02', '2027-03-06'],
        valor_diaria: '250.00',
      },
    })
    expect(non_overlapping_res.statusCode).toBe(201)

    // 4. Calendar query returns both rate plans
    const cal_res = await app.inject({
      method: 'GET',
      url: `/tarifarios/calendario?categoria_quarto_id=${cat_a_id}`,
      cookies: { token: token_hotel_a },
    })
    expect(cal_res.statusCode).toBe(200)
    expect(cal_res.json().data).toHaveLength(2)

    // 5. Edit rate plan without self-conflict
    const patch_res = await app.inject({
      method: 'PATCH',
      url: `/tarifarios/${created.id}`,
      cookies: { token: token_hotel_a },
      payload: {
        nome: 'Baixa temporada atualizada',
        valor_diaria: '215.00',
      },
    })
    expect(patch_res.statusCode).toBe(200)
    expect(patch_res.json().valor_diaria).toBe('215.00')

    // 6. Deactivate and reactivate
    const deact_res = await app.inject({
      method: 'PATCH',
      url: `/tarifarios/${created.id}/desativar`,
      cookies: { token: token_hotel_a },
    })
    expect(deact_res.statusCode).toBe(200)
    expect(deact_res.json().ativo).toBe(false)

    const act_res = await app.inject({
      method: 'PATCH',
      url: `/tarifarios/${created.id}/ativar`,
      cookies: { token: token_hotel_a },
    })
    expect(act_res.statusCode).toBe(200)
    expect(act_res.json().ativo).toBe(true)
  })

  it('enforces multi-tenant isolation when Hotel B attempts to access Hotel A resources', async () => {
    const create_res = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_a },
      payload: {
        categoria_quarto_id: cat_a_id,
        regime_alimentacao_id: REGIME_ID,
        nome: 'Tarifa Hotel A',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      },
    })
    const created = create_res.json()

    const get_by_b = await app.inject({
      method: 'GET',
      url: `/tarifarios/${created.id}`,
      cookies: { token: token_hotel_b },
    })
    expect(get_by_b.statusCode).toBe(404)

    const patch_by_b = await app.inject({
      method: 'PATCH',
      url: `/tarifarios/${created.id}`,
      cookies: { token: token_hotel_b },
      payload: { nome: 'Tentativa Hotel B' },
    })
    expect(patch_by_b.statusCode).toBe(404)

    const deact_by_b = await app.inject({
      method: 'PATCH',
      url: `/tarifarios/${created.id}/desativar`,
      cookies: { token: token_hotel_b },
    })
    expect(deact_by_b.statusCode).toBe(404)

    const create_foreign_cat = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_b },
      payload: {
        categoria_quarto_id: cat_a_id,
        regime_alimentacao_id: REGIME_ID,
        nome: 'Categoria de outro hotel',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      },
    })
    expect(create_foreign_cat.statusCode).toBe(404)
  })

  it('rejects creation when regime_alimentacao_id is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tarifarios',
      cookies: { token: token_hotel_a },
      payload: {
        categoria_quarto_id: cat_a_id,
        nome: 'Sem regime',
        datas: ['2027-03-01'],
        valor_diaria: '200.00',
      },
    })
    expect(res.statusCode).toBe(400)
  })
})
