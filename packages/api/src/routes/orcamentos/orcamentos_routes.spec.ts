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
import { InMemoryLeadRepository } from '@/core/repositories/leads/in-memory/in_memory_lead_repository'
import { InMemoryOrcamentoRepository } from '@/core/repositories/orcamentos/in-memory/in_memory_orcamento_repository'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import authPlugin from '@/plugins/auth_plugin'
import { orcamentos_routes } from './orcamentos_routes'

const HOTEL_ID = 'hotel-123'
const TEST_SECRET = 'test-jwt-secret-xyz'

let orcamentos_repo: InMemoryOrcamentoRepository
let leads_repo: InMemoryLeadRepository
let regimes_repo: InMemoryRegimeAlimentacaoRepository
let categorias_repo: InMemoryCategoriaQuartoRepository
let tarifarios_repo: InMemoryTarifarioRepository
let parceiros_repo: InMemoryParceiroComercialRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/orcamentos/implementation/postgres_orcamento_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresOrcamentoRepository: vi.fn(function () {
      return orcamentos_repo
    }),
  })
)

vi.mock(
  '@/core/repositories/leads/implementation/postgres_lead_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresLeadRepository: vi.fn(function () {
      return leads_repo
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
  '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresCategoriaQuartoRepository: vi.fn(function () {
      return categorias_repo
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
  await app.register(orcamentos_routes)
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

describe('Orcamentos Routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    orcamentos_repo = new InMemoryOrcamentoRepository()
    leads_repo = new InMemoryLeadRepository()
    regimes_repo = new InMemoryRegimeAlimentacaoRepository()
    categorias_repo = new InMemoryCategoriaQuartoRepository()
    tarifarios_repo = new InMemoryTarifarioRepository()
    parceiros_repo = new InMemoryParceiroComercialRepository()

    app = await build_app()
  })

  it('GET /orcamentos/publico/:token returns public view data without authentication', async () => {
    // 1. Criar lead
    const lead = await leads_repo.create({
      hotel_id: HOTEL_ID,
      nome: 'Carlos Santos',
      telefone: '11988889999',
      email: 'carlos@exemplo.com',
    })

    // 2. Criar regime
    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Meia Pensão',
      cor_pulseira: '#10B981',
      ativo: true,
    })

    // 3. Criar categoria
    const cat = await categorias_repo.create({
      hotel_id: HOTEL_ID,
      nome: 'Bangalô Vista Mar',
      status: 'S',
    })

    // 4. Criar orçamento
    const orcamento = await orcamentos_repo.create({
      hotel_id: HOTEL_ID,
      lead_id: lead.id,
      regime_alimentacao_id: regime.id,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-10',
      check_out: '2026-12-13',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      valor_total: '900.00',
      detalhamento_noites: [
        {
          data: '2026-12-10',
          tarifario_id: 't1',
          tarifario_nome: 'Padrão',
          valor_diaria: '300.00',
        },
        {
          data: '2026-12-11',
          tarifario_id: 't1',
          tarifario_nome: 'Padrão',
          valor_diaria: '300.00',
        },
        {
          data: '2026-12-12',
          tarifario_id: 't1',
          tarifario_nome: 'Padrão',
          valor_diaria: '300.00',
        },
      ],
      token_publico: 'public-token-1234567890abcdef',
    })

    // 5. Consultar endpoint público SEM TOKEN JWT
    const response = await app.inject({
      method: 'GET',
      url: `/orcamentos/publico/${orcamento.token_publico}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.token_publico).toBe(orcamento.token_publico)
    expect(body.total_noites).toBe(3)
    expect(body.valor_total).toBe('900.00')
    expect(body.status).toBe('pendente')
    expect(body.detalhamento_noites).toHaveLength(3)
  })

  it('GET /orcamentos/publico/:token returns 404 for unknown token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/orcamentos/publico/token-inexistente',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toHaveProperty('message')
  })

  it('POST /orcamentos creates budget and persists lead with authentication', async () => {
    const token = make_token(app, HOTEL_ID)

    const cat = await categorias_repo.create({
      hotel_id: HOTEL_ID,
      nome: 'Suíte Standard',
      status: 'S',
    })
    tarifarios_repo.register_category(cat.id, cat.nome, 'S')

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Café da Manhã',
      cor_pulseira: '#3B82F6',
      ativo: true,
    })
    tarifarios_repo.register_regime_alimentacao(
      regime.id,
      regime.titulo,
      regime.cor_pulseira
    )

    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      categoria_quarto_id: cat.id,
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa Café',
      datas: ['2026-12-05'],
      valor_diaria: '250.00',
      ativo: true,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orcamentos',
      cookies: { token },
      payload: {
        regime_alimentacao_id: regime.id,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-05',
        check_out: '2026-12-06',
        quantidade_adultos: 2,
        quantidade_criancas: 0,
        quantidade_pets: 0,
        cupom_desconto: 'BLACKFRIDAY',
        lead: {
          nome: 'Fernanda Lima',
          telefone: '11977778888',
          email: 'fernanda@exemplo.com',
        },
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.id).toBeDefined()
    expect(body.valor_total).toBe('250.00')
    expect(body.cupom_desconto).toBe('BLACKFRIDAY')
    expect(body.token_publico).toBeDefined()
  })

  it('POST /orcamentos creates budget linked to partner and calculates rates strictly for that partner', async () => {
    const token = make_token(app, HOTEL_ID)

    const parceiro = await parceiros_repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Corporativa Viagens Ltda',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    const cat = await categorias_repo.create({
      hotel_id: HOTEL_ID,
      nome: 'Suíte Corporativa',
      status: 'S',
    })
    tarifarios_repo.register_category(cat.id, cat.nome, 'S')

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'Café da Manhã',
      cor_pulseira: '#3B82F6',
      ativo: true,
    })
    tarifarios_repo.register_regime_alimentacao(
      regime.id,
      regime.titulo,
      regime.cor_pulseira
    )

    // Tarifário exclusivo do parceiro
    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      parceiro_id: parceiro.id,
      categoria_quarto_id: cat.id,
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa Corporativa Acordada',
      datas: ['2026-12-05'],
      valor_diaria: '190.00',
      ativo: true,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orcamentos',
      cookies: { token },
      payload: {
        regime_alimentacao_id: regime.id,
        categoria_quarto_id: cat.id,
        parceiro_id: parceiro.id,
        check_in: '2026-12-05',
        check_out: '2026-12-06',
        quantidade_adultos: 1,
        quantidade_criancas: 0,
        quantidade_pets: 0,
        lead: {
          nome: 'Executivo Carlos',
          telefone: '11988887777',
          email: 'executivo@corporativo.com',
        },
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.id).toBeDefined()
    expect(body.parceiro_id).toBe(parceiro.id)
    expect(body.valor_total).toBe('190.00')
    expect(body.detalhamento_noites[0].tarifario_nome).toBe(
      'Tarifa Corporativa Acordada'
    )
  })

  it('POST /orcamentos returns 400 when partner does not have coverage for dates', async () => {
    const token = make_token(app, HOTEL_ID)

    const parceiro = await parceiros_repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência Sem Cobertura Ltda',
      documento: '33000167000101',
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'faturado',
      status: 'ativo',
    })

    const cat = await categorias_repo.create({
      hotel_id: HOTEL_ID,
      nome: 'Suíte Luxo',
      status: 'S',
    })
    tarifarios_repo.register_category(cat.id, cat.nome, 'S')

    const regime = await regimes_repo.create({
      hotel_id: HOTEL_ID,
      titulo: 'All Inclusive',
      cor_pulseira: '#10B981',
      ativo: true,
    })
    tarifarios_repo.register_regime_alimentacao(
      regime.id,
      regime.titulo,
      regime.cor_pulseira
    )

    // Apenas tarifário público existe para essa data, mas o orçamento foi solicitado com parceiro_id
    await tarifarios_repo.create({
      hotel_id: HOTEL_ID,
      parceiro_id: null,
      categoria_quarto_id: cat.id,
      regime_alimentacao_id: regime.id,
      nome: 'Tarifa Pública',
      datas: ['2026-12-05'],
      valor_diaria: '300.00',
      ativo: true,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/orcamentos',
      cookies: { token },
      payload: {
        regime_alimentacao_id: regime.id,
        categoria_quarto_id: cat.id,
        parceiro_id: parceiro.id,
        check_in: '2026-12-05',
        check_out: '2026-12-06',
        quantidade_adultos: 2,
        lead: {
          nome: 'Cliente Parceiro',
          telefone: '11988887777',
          email: 'cliente@parceiro.com',
        },
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toContain('Não há tarifário ativo elegível')
  })
})
