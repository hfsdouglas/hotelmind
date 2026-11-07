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
      nome_hotel: 'Hotel Paradiso',
      nome_fantasia: 'Paradiso Resort',
      razao_social: 'Paradiso Hotelaria LTDA',
      cnpj: '12345678000100',
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
      expect(body.hotel_id).toBe(HOTEL_ID)
      expect(body.hotel_name).toBe('Paradiso Resort')
      expect(body.color_primary).toBe('#1e40af')
      expect(body.reception_24h).toBe(true)
    })
  })

  describe('PUT /hoteis/configuracao', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/hoteis/configuracao',
        payload: {
          hotel_name: 'Novo Nome',
          category: 'HOTEL',
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
          hotel_name: 'Paradiso Beach Resort',
          legal_name: 'Paradiso Beach Hotelaria LTDA',
          tax_id: '12345678000100',
          category: 'RESORT',
          star_rating: 5,
          short_description: 'Resort à beira-mar',
          full_description: 'Descrição completa',
          logo_primary: 'data:image/png;base64,primary',
          logo_dark: null,
          favicon: null,
          color_primary: '#0284c7',
          color_secondary: '#0f172a',
          color_background: '#ffffff',
          color_surface: '#f0f9ff',
          color_text_primary: '#0c4a6e',
          color_text_secondary: '#0369a1',
          color_accent: '#f59e0b',
          free_child_age_limit: 7,
          free_child_max_per_room: 2,
          checkin_time: '15:00',
          checkout_time: '11:00',
          reception_24h: true,
          reception_opening_time: null,
          reception_closing_time: null,
          pet_friendly: true,
          pet_max_weight_kg: 12,
          smoking_allowed: false,
          smoking_sanitization_fee: 350,
          parking_type: 'PAGO_LOCAL',
          parking_fee_per_day: 40,
          parking_reservation_required: true,
          parking_covered: 'COBERTO',
          wifi_available: true,
          wifi_type: 'GRATUITO_TOTAL',
          wifi_ssid_default: 'Paradiso_Guest',
          wifi_password_default: 'paradiso2026',
          wifi_show_on_voucher: true,
        },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.hotel_name).toBe('Paradiso Beach Resort')
      expect(body.category).toBe('RESORT')
      expect(body.color_primary).toBe('#0284c7')
      expect(body.wifi_ssid_default).toBe('Paradiso_Guest')
    })

    it('returns 400 when reception_24h is false but hours are missing', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/hoteis/configuracao',
        cookies: { token },
        payload: {
          hotel_name: 'Paradiso Beach Resort',
          category: 'HOTEL',
          color_primary: '#0284c7',
          reception_24h: false,
          reception_opening_time: null,
          reception_closing_time: null,
        },
      })

      expect(res.statusCode).toBe(400)
    })
  })
})
