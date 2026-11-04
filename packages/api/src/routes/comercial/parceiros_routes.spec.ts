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
import authPlugin from '@/plugins/auth_plugin'
import { parceiros_comerciais_routes } from './parceiros_routes'

const HOTEL_ID = 'hotel-123'
const TEST_SECRET = 'test-jwt-secret-comercial'

let repo: InMemoryParceiroComercialRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/parceiros_comerciais/implementation/postgres_parceiro_comercial_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresParceiroComercialRepository: vi.fn(function () {
      return repo
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
  await app.register(parceiros_comerciais_routes)
  await app.ready()

  return app
}

function make_token(app: FastifyInstance, hotel_id: string) {
  return app.jwt.sign(
    {
      sub: `user-${hotel_id}`,
      user: {
        hotelId: hotel_id,
        nomecompleto: 'Gerente Comercial',
        email: `comercial@${hotel_id}.com`,
      },
    },
    { expiresIn: '1h' }
  )
}

describe('Parceiros Comerciais Routes', () => {
  let app: FastifyInstance
  let token: string

  const CPF_VALIDO = '52998224725'
  const CNPJ_VALIDO = '11222333000181'

  beforeEach(async () => {
    repo = new InMemoryParceiroComercialRepository()
    app = await build_app()
    token = make_token(app, HOTEL_ID)
  })

  it('POST /comercial/parceiros - deve criar um parceiro comercial com sucesso', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/comercial/parceiros',
      cookies: { token },
      payload: {
        tipo_parceiro: 'agencia_viagens',
        tipo_pessoa: 'PJ',
        razao_social: 'Turismo Estrela Ltda',
        nome_fantasia: 'Estrela Turismo',
        documento: CNPJ_VALIDO,
        logradouro: 'Av Central',
        numero: '500',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '80010-000',
        pais: 'Brasil',
        modelo_tarifario: 'comissionada',
        comissao_padrao: 12,
        politica_faturamento: 'faturado',
        prazo_pagamento_dias: 20,
        limite_credito: 30000,
        allotment_quartos: 3,
        contatos: [
          {
            tipo_contato: 'comercial',
            nome: 'Carlos Lima',
            email: 'carlos@estrela.com.br',
            telefone: '41999998888',
            cargo: 'Gerente de Contas',
          },
        ],
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.id).toBeDefined()
    expect(body.razao_social).toBe('Turismo Estrela Ltda')
    expect(body.contatos).toHaveLength(1)
    expect(body.contatos[0].nome).toBe('Carlos Lima')
  })

  it('POST /comercial/parceiros - deve rejeitar criação sem autenticação (401)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/comercial/parceiros',
      payload: {
        tipo_parceiro: 'agente_autonomo',
        tipo_pessoa: 'PF',
        razao_social: 'Agente Sem Auth',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('GET /comercial/parceiros - deve listar parceiros cadastrados', async () => {
    await repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agente_autonomo',
      tipo_pessoa: 'PF',
      razao_social: 'Agente Listado',
      documento: CPF_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const response = await app.inject({
      method: 'GET',
      url: '/comercial/parceiros',
      cookies: { token },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].razao_social).toBe('Agente Listado')
  })

  it('GET /comercial/parceiros/:id - deve recuperar parceiro por ID', async () => {
    const criado = await repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'clube_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Clube Férias',
      documento: CNPJ_VALIDO,
      modelo_tarifario: 'net',
      politica_faturamento: 'voucher',
    })

    const response = await app.inject({
      method: 'GET',
      url: `/comercial/parceiros/${criado.id}`,
      cookies: { token },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.id).toBe(criado.id)
    expect(body.tipo_parceiro).toBe('clube_turismo')
  })

  it('PUT /comercial/parceiros/:id - deve atualizar regras comerciais', async () => {
    const criado = await repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'operadora_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Operadora Sul',
      documento: CNPJ_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const response = await app.inject({
      method: 'PUT',
      url: `/comercial/parceiros/${criado.id}`,
      cookies: { token },
      payload: {
        modelo_tarifario: 'net',
        politica_faturamento: 'faturado',
        limite_credito: 80000,
        prazo_pagamento_dias: 30,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.modelo_tarifario).toBe('net')
    expect(body.politica_faturamento).toBe('faturado')
    expect(body.limite_credito).toBe('80000.00')
  })

  it('PATCH /comercial/parceiros/:id/status - deve alterar status para bloqueado com motivo', async () => {
    const criado = await repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agencia Bloqueável',
      documento: CNPJ_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const response = await app.inject({
      method: 'PATCH',
      url: `/comercial/parceiros/${criado.id}/status`,
      cookies: { token },
      payload: {
        status: 'bloqueado',
        motivo_bloqueio: 'Suspenso para renegociação comercial',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.status).toBe('bloqueado')
    expect(body.motivo_bloqueio).toBe('Suspenso para renegociação comercial')
  })

  it('DELETE /comercial/parceiros/:id - deve excluir parceiro', async () => {
    const criado = await repo.create({
      hotel_id: HOTEL_ID,
      tipo_parceiro: 'agente_autonomo',
      tipo_pessoa: 'PF',
      razao_social: 'Agente a Deletar',
      documento: CPF_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/comercial/parceiros/${criado.id}`,
      cookies: { token },
    })

    expect(response.statusCode).toBe(204)
    expect(repo.items).toHaveLength(0)
  })
})
