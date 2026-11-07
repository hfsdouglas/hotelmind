import fastifyCookie from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { type FastifyInstance, fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryHotelConfiguracaoRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_configuracao_repository'
import authPlugin from '@/plugins/auth_plugin'
import { hotel_configuracao_routes } from './hotel_configuracao_routes'

const HOTEL_ID = '11111111-1111-1111-1111-111111111111'
const TEST_SECRET = 'test-jwt-secret'

let repository: InMemoryHotelConfiguracaoRepository

vi.mock('@/lib/prisma', () => ({ db: {} }))

vi.mock(
  '@/core/repositories/hotels/implementation/postgres_hotel_configuracao_repository',
  () => ({
    // biome-ignore lint/complexity/useArrowFunction: constructor function for new operator
    PostgresHotelConfiguracaoRepository: vi.fn(function () {
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
  await app.register(hotel_configuracao_routes)
  await app.ready()

  return app
}

function make_token(app: FastifyInstance, hotel_id: string) {
  return app.jwt.sign(
    {
      sub: `user-${hotel_id}`,
      user: {
        hotelId: hotel_id,
        nomecompleto: 'Gestor Teste',
        email: 'gestor@hotel.com',
      },
    },
    { expiresIn: '1h' }
  )
}

describe('hotel_configuracao_routes (web)', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    repository = new InMemoryHotelConfiguracaoRepository()
    repository.seedHotel({
      id: HOTEL_ID,
      nome_hotel: 'Hotel Paradiso Corp',
      nome_fantasia: 'Paradiso Resort',
      razao_social: 'Paradiso Hotelaria LTDA',
      cnpj: '12345678000100',
      email_comercial: 'contato@paradiso.com',
      telefone_comercial: '11999999999',
    })

    app = await build_app()
    token = make_token(app, HOTEL_ID)
  })

  describe('GET /hoteis/configuracao', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/hoteis/configuracao',
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns 200 with hotel configuration when authenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/hoteis/configuracao',
        cookies: { token },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.id).toBe(HOTEL_ID)
      expect(body.nome_fantasia).toBe('Paradiso Resort')
      expect(body.email_comercial).toBe('contato@paradiso.com')
      expect(body.categoria).toBe('HOTEL')
      expect(body.recepcao_24h).toBe(true)
    })
  })

  describe('PUT /hoteis/configuracao', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/hoteis/configuracao',
        payload: {
          nome_fantasia: 'Novo Nome',
          categoria: 'HOTEL',
        },
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns 200 and updates configuration with valid payload', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/hoteis/configuracao',
        cookies: { token },
        payload: {
          nome_hotel: 'Paradiso Beach Hotelaria SA',
          nome_fantasia: 'Paradiso Beach Resort',
          razao_social: 'Paradiso Beach Hotelaria LTDA',
          cnpj: '12345678000100',
          email_comercial: 'contato@paradiso.com',
          telefone_comercial: '11999999999',
          celular: '11988887777',
          website: 'https://paradiso.com.br',
          categoria: 'RESORT',
          classificacao_estrelas: 5,
          descricao_curta: 'Resort à beira-mar',
          descricao_completa: 'Descrição completa',
          limite_idade_crianca_gratis: 7,
          quantidade_max_criancas_gratis: 2,
          horario_checkin: '15:00',
          horario_checkout: '11:00',
          recepcao_24h: true,
          recepcao_opening_time: null,
          recepcao_closing_time: null,
          aceita_pets: true,
          peso_maximo_pet_kg: 12,
          permite_fumar: false,
          taxa_higienizacao_fumo: 350,
          tipo_estacionamento: 'PAGO_LOCAL',
          valor_diaria_estacionamento: 40,
          estacionamento_reserva_previa: true,
          cobertura_estacionamento: 'COBERTO',
          possui_wifi: true,
          tipo_wifi: 'GRATUITO_TOTAL',
          nome_rede_wifi: 'Paradiso_Guest',
          senha_rede_wifi: 'paradiso2026',
          exibir_wifi_voucher: true,
          tema: {
            logo_principal: 'data:image/png;base64,primary',
            logo_escuro: null,
            favicon: null,
            cor_primaria: '#0284c7',
            cor_secundaria: '#0f172a',
            cor_fundo: '#ffffff',
            cor_superficie: '#f0f9ff',
            cor_texto_principal: '#0c4a6e',
            cor_texto_secundario: '#0369a1',
            cor_destaque: '#f59e0b',
          },
        },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.nome_fantasia).toBe('Paradiso Beach Resort')
      expect(body.categoria).toBe('RESORT')
      expect(body.tema?.cor_primaria).toBe('#0284c7')
      expect(body.nome_rede_wifi).toBe('Paradiso_Guest')
    })

    it('returns 400 when recepcao_24h is false but hours are missing', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/hoteis/configuracao',
        cookies: { token },
        payload: {
          nome_hotel: 'Paradiso Beach Hotelaria SA',
          nome_fantasia: 'Paradiso Beach Resort',
          razao_social: 'Paradiso Beach Hotelaria LTDA',
          cnpj: '12345678000100',
          email_comercial: 'contato@paradiso.com',
          telefone_comercial: '11999999999',
          categoria: 'HOTEL',
          recepcao_24h: false,
          horario_abertura_recepcao: null,
          horario_fechamento_recepcao: null,
          tema: {
            cor_primaria: '#0284c7',
          },
        },
      })

      expect(res.statusCode).toBe(400)
    })
  })
})
