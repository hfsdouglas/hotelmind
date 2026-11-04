import fastifyCookie from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import authPlugin from '@/plugins/auth_plugin'
import { regimes_alimentacao_routes } from './regimes_alimentacao_routes'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'
const TEST_SECRET = 'test-jwt-secret'

let repository: InMemoryRegimeAlimentacaoRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/regimes_alimentacao/implementation/postgres_regime_alimentacao_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresRegimeAlimentacaoRepository: vi.fn(function () {
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
  await app.register(regimes_alimentacao_routes)
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

describe('Regimes de Alimentação Routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    repository = new InMemoryRegimeAlimentacaoRepository()
    app = await build_app()
  })

  it('requires authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/regimes_alimentacao' })
    expect(res.statusCode).toBe(401)
  })

  it('creates a new regime de alimentacao (POST /regimes_alimentacao)', async () => {
    const token = make_token(app, HOTEL_A)

    const response = await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token },
      payload: {
        titulo: 'Café da Manhã Incluso',
        descricao: 'Buffet completo das 06:00 às 10:00',
        cor_pulseira: '#3b82f6',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.titulo).toBe('Café da Manhã Incluso')
    expect(body.cor_pulseira).toBe('#3B82F6')
    expect(body.ativo).toBe(true)
  })

  it('returns 409 when creating duplicate title for the same hotel', async () => {
    const token = make_token(app, HOTEL_A)

    await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token },
      payload: {
        titulo: 'All Inclusive',
        cor_pulseira: '#22c55e',
      },
    })

    const duplicate_response = await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token },
      payload: {
        titulo: 'All Inclusive',
        cor_pulseira: '#ef4444',
      },
    })

    expect(duplicate_response.statusCode).toBe(409)
  })

  it('lists regimes for hotel (GET /regimes_alimentacao)', async () => {
    const token_a = make_token(app, HOTEL_A)
    const token_b = make_token(app, HOTEL_B)

    await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token: token_a },
      payload: {
        titulo: 'Hotel A Regime',
        cor_pulseira: '#ff0000',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token: token_b },
      payload: {
        titulo: 'Hotel B Regime',
        cor_pulseira: '#00ff00',
      },
    })

    const response_a = await app.inject({
      method: 'GET',
      url: '/regimes_alimentacao',
      cookies: { token: token_a },
    })

    expect(response_a.statusCode).toBe(200)
    const body_a = response_a.json()
    expect(body_a.data).toHaveLength(1)
    expect(body_a.data[0].titulo).toBe('Hotel A Regime')
  })

  it('updates an existing regime (PUT /regimes_alimentacao/:id)', async () => {
    const token = make_token(app, HOTEL_A)

    const create_res = await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token },
      payload: {
        titulo: 'Pensão Completa',
        cor_pulseira: '#f59e0b',
      },
    })

    const id = create_res.json().id

    const update_res = await app.inject({
      method: 'PUT',
      url: `/regimes_alimentacao/${id}`,
      cookies: { token },
      payload: {
        titulo: 'Pensão Completa Premium',
        descricao: 'Bebidas inclusas',
        cor_pulseira: '#8b5cf6',
        ativo: true,
      },
    })

    expect(update_res.statusCode).toBe(200)
    expect(update_res.json().titulo).toBe('Pensão Completa Premium')
    expect(update_res.json().cor_pulseira).toBe('#8B5CF6')
  })

  it('activates and deactivates a regime (PATCH /regimes_alimentacao/:id/desativar e ativar)', async () => {
    const token = make_token(app, HOTEL_A)

    const create_res = await app.inject({
      method: 'POST',
      url: '/regimes_alimentacao',
      cookies: { token },
      payload: {
        titulo: 'Regime Sazonal',
        cor_pulseira: '#06b6d4',
      },
    })

    const id = create_res.json().id

    const desativar_res = await app.inject({
      method: 'PATCH',
      url: `/regimes_alimentacao/${id}/desativar`,
      cookies: { token },
    })
    expect(desativar_res.statusCode).toBe(200)
    expect(desativar_res.json().ativo).toBe(false)

    const ativar_res = await app.inject({
      method: 'PATCH',
      url: `/regimes_alimentacao/${id}/ativar`,
      cookies: { token },
    })
    expect(ativar_res.statusCode).toBe(200)
    expect(ativar_res.json().ativo).toBe(true)
  })
})
