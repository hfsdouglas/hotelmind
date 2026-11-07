import fastifyCookie from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { InMemoryQuartoRepository } from '@/core/repositories/quartos/in-memory/in_memory_quarto_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import {
  InMemoryReservaHospedeRepository,
  InMemoryReservaRepository,
} from '@/core/repositories/reservas/in-memory/in_memory_reserva_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import authPlugin from '@/plugins/auth_plugin'
import { reservas_routes } from './reservas_routes'

const HOTEL_ID = 'hotel-res-123'
const TEST_SECRET = 'test-jwt-secret-reservas'

let reservas_repo: InMemoryReservaRepository
let hospedes_repo: InMemoryReservaHospedeRepository
let quartos_repo: InMemoryQuartoRepository
let regimes_repo: InMemoryRegimeAlimentacaoRepository
let tarifarios_repo: InMemoryTarifarioRepository
let parceiros_repo: InMemoryParceiroComercialRepository

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
  '@/core/repositories/quartos/implementation/postgres_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresQuartoRepository: vi.fn(function () {
      return quartos_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/regimes_alimentacao/implementation/postgres_regime_alimentacao_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresRegimeAlimentacaoRepository: vi.fn(function () {
      return regimes_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/tarifarios/implementation/postgres_tarifario_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresTarifarioRepository: vi.fn(function () {
      return tarifarios_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/parceiros_comerciais/implementation/postgres_parceiro_comercial_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresParceiroComercialRepository: vi.fn(function () {
      return parceiros_repo
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
  await app.register(reservas_routes)
  await app.ready()

  return app
}

function make_token(app: FastifyInstance, hotel_id: string) {
  return app.jwt.sign(
    {
      sub: `user-${hotel_id}`,
      user: {
        hotelId: hotel_id,
        nomecompleto: 'Recepção Hotel',
        email: `recepcao@${hotel_id}.com`,
      },
    },
    { expiresIn: '1h' }
  )
}

describe('Reservas Routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    hospedes_repo = new InMemoryReservaHospedeRepository()
    reservas_repo = new InMemoryReservaRepository(hospedes_repo)
    quartos_repo = new InMemoryQuartoRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

    app = await build_app()
  })

  it('POST /reservas cria reserva com sucesso e calcula valor congelado', async () => {
    const token = make_token(app, HOTEL_ID)

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Café da Manhã',
      cor_pulseira: '#22c55e',
      ativo: true,
    })

    const quarto = await quartos_repo.create({
      hotel_id: HOTEL_ID,
      categoria_id: 'cat-master',
      identificacao: '201',
      limite_hospedes: 4,
      camas: [{ tipo: 'casal', quantidade: 2 }],
    })

    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      categoria_quarto_id: 'cat-master',
      regime_alimentacao_id: regime.id,
      nome: 'Tarifário Master',
      valor_diaria: '300.00',
      datas: ['2026-12-10', '2026-12-11'],
      ativo: true,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/reservas',
      cookies: { token },
      payload: {
        titular_nome: 'Mariana Costa',
        titular_telefone: '11988887777',
        quarto_id: quarto.id,
        regime_alimentacao_id: regime.id,
        check_in: '2026-12-10',
        check_out: '2026-12-12',
        quantidade_adultos: 2,
        quantidade_criancas: 1,
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.id).toBeDefined()
    expect(body.codigo).toBe('FR-000001')
    expect(body.valor_total).toBe('600.00')
    expect(body.hospedes).toHaveLength(3)
    expect(body.status).toBe('a_confirmar')
  })

  it('GET /reservas/disponibilidade lista suítes livres com valor total para o período', async () => {
    const token = make_token(app, HOTEL_ID)

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Café da Manhã',
      cor_pulseira: '#22c55e',
      ativo: true,
    })

    await quartos_repo.create({
      hotel_id: HOTEL_ID,
      categoria_id: 'cat-master',
      identificacao: '201',
      limite_hospedes: 3,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })

    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      categoria_quarto_id: 'cat-master',
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa',
      valor_diaria: '200.00',
      datas: ['2026-12-10'],
      ativo: true,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/reservas/disponibilidade?check_in=2026-12-10&check_out=2026-12-11&regime_alimentacao_id=${regime.id}&pessoas=2`,
      cookies: { token },
    })

    expect(response.statusCode).toBe(200)
    const list = response.json()
    expect(list).toHaveLength(1)
    expect(list[0].identificacao).toBe('201')
    expect(list[0].valor_total).toBe('200.00')
  })

  it('GET /reservas/disponibilidade filtra por parceiro comercial exibindo apenas tarifas acordadas', async () => {
    const token = make_token(app, HOTEL_ID)

    const parceiro = await parceiros_repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Corporativa S.A.',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Café da Manhã',
      cor_pulseira: '#22c55e',
      ativo: true,
    })

    await quartos_repo.create({
      hotel_id: HOTEL_ID,
      categoria_id: 'cat-corp',
      identificacao: '301',
      limite_hospedes: 2,
      camas: [{ tipo: 'casal', quantidade: 1 }],
    })

    // Cadastra tarifa exclusiva para o parceiro
    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      parceiro_id: parceiro.id,
      categoria_quarto_id: 'cat-corp',
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa Corporativa Especial',
      valor_diaria: '175.00',
      datas: ['2026-12-10'],
      ativo: true,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/reservas/disponibilidade?check_in=2026-12-10&check_out=2026-12-11&regime_alimentacao_id=${regime.id}&pessoas=2&parceiro_id=${parceiro.id}`,
      cookies: { token },
    })

    expect(response.statusCode).toBe(200)
    const list = response.json()
    expect(list).toHaveLength(1)
    expect(list[0].identificacao).toBe('301')
    expect(list[0].valor_total).toBe('175.00')
  })

  it('GET /reservas lista reservas do hotel com paginação e filtros', async () => {
    const token = make_token(app, HOTEL_ID)

    await reservas_repo.create({
      hotel_id: HOTEL_ID,
      codigo: 'RES-000001',
      titular_nome: 'Joao Silva',
      quarto_id: 'q1',
      regime_alimentacao_id: 'r1',
      check_in: '2026-12-10',
      check_out: '2026-12-12',
      quantidade_adultos: 2,
      valor_total: '400.00',
      detalhamento_diarias: [],
      token_fnrh: 'token-1234567890abcdef12345678',
    })

    const response = await app.inject({
      method: 'GET',
      url: '/reservas',
      cookies: { token },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].titular_nome).toBe('Joao Silva')
  })
})
