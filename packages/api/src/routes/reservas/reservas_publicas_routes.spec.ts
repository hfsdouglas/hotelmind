import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryHotelRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { setRateLimit } from '@/plugins/rate_limit_plugin'
import { reservas_publicas_routes } from './reservas_publicas_routes'

const HOTEL_ID = 'hotel-fnrh-123'

let reservas_repo: InMemoryReservaRepository
let hospedes_repo: InMemoryReservaHospedeRepository
let hotels_repo: InMemoryHotelRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/reservas/implementation/postgres_reserva_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresReservaRepository: vi.fn(function () {
      return reservas_repo
    }),
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresReservaHospedeRepository: vi.fn(function () {
      return hospedes_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/hotels/implementation/postgres_hotel_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresHotelRepository: vi.fn(function () {
      return hotels_repo
    }),
  })
)

async function build_app(): Promise<FastifyInstance> {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  setRateLimit(app)
  await app.register(reservas_publicas_routes)
  await app.ready()

  return app
}

describe('Reservas Públicas (FNRH) Routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    hotels_repo = new InMemoryHotelRepository()

    app = await build_app()
  })

  it('GET /reservas/publico/:token retorna visão pública sem autenticação', async () => {
    const reserva = await reservas_repo.create({
      hotel_id: HOTEL_ID,
      codigo: 'RES-000001',
      titular_nome: 'Marcos Braz',
      quarto_id: 'q1',
      regime_alimentacao_id: 'r1',
      check_in: '2026-12-01',
      check_out: '2026-12-10',
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '500.00',
      detalhamento_diarias: [],
      token_fnrh: 'token-valido-1234567890abcdef',
      token_fnrh_ativo: true,
      status: 'confirmada',
    })

    await hospedes_repo.create_many([
      {
        reserva_id: reserva.id,
        posicao: 1,
        ficha_status: 'pendente',
        nome_completo: 'Marcos Braz',
      },
    ])

    const response = await app.inject({
      method: 'GET',
      url: `/reservas/publico/${reserva.token_fnrh}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.titular_nome).toBe('Marcos Braz')
    expect(body.total_hospedes).toBe(1)
    expect(body.hospedes).toHaveLength(1)
  })

  it('GET /reservas/publico/:token retorna 404 para token inexistente ou inativo', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/reservas/publico/token-inexistente',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toHaveProperty('message')
  })

  it('PUT /reservas/publico/:token/hospedes/:posicao salva rascunho de ficha com sucesso', async () => {
    const reserva = await reservas_repo.create({
      hotel_id: HOTEL_ID,
      codigo: 'RES-000001',
      titular_nome: 'Marcos Braz',
      quarto_id: 'q1',
      regime_alimentacao_id: 'r1',
      check_in: '2026-12-01',
      check_out: '2026-12-10',
      quantidade_adultos: 1,
      quantidade_criancas: 0,
      valor_total: '500.00',
      detalhamento_diarias: [],
      token_fnrh: 'token-valido-1234567890abcdef',
      token_fnrh_ativo: true,
      status: 'confirmada',
    })

    await hospedes_repo.create_many([
      {
        reserva_id: reserva.id,
        posicao: 1,
        ficha_status: 'pendente',
      },
    ])

    const response = await app.inject({
      method: 'PUT',
      url: `/reservas/publico/${reserva.token_fnrh}/hospedes/1`,
      payload: {
        nome_completo: 'Marcos Braz Junior',
        nacionalidade: 'Brasileira',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.nome_completo).toBe('Marcos Braz Junior')
    expect(body.ficha_status).toBe('rascunho')
  })
})
