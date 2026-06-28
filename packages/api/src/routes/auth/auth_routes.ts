import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { HotelRepository, UserRepository } from '@/db/repositories'
import { BcryptPasswordHasher } from '@/lib/bcrypt_password_hasher'
import { LoginUseCase } from '@/core/usecases/login_use_case'
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/core/errors/authentication_error'
import {
  login_body_schema,
  login_error_schema,
  login_response_schema,
} from '@/schemas/auth/login_schema'

export async function auth_routes(app: FastifyTypedInstance) {
  const login_use_case = new LoginUseCase(
    new UserRepository(db),
    new HotelRepository(db),
    new BcryptPasswordHasher(),
  )

  app.get(
    '/auth/me',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Verifica sessão ativa',
        response: {
          200: z.object({ ok: z.literal(true) }),
          401: login_error_schema,
        },
      },
    },
    async () => ({ ok: true as const }),
  )

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',
        body: login_body_schema,
        response: {
          200: login_response_schema,
          401: login_error_schema,
          500: login_error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { user, hotel } = await login_use_case.execute(request.body)

        const token = app.jwt.sign(
          {
            sub: user.id,
            user: {
              hotelId: hotel.id,
              nomecompleto: user.nome_completo,
              email: user.email,
            },
          },
          { expiresIn: '7d' },
        )

        reply.setCookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        return reply.status(200).send({
          user: {
            id: user.id,
            nome_completo: user.nome_completo,
            email: user.email,
            hotel_id: user.hotel_id,
          },
          hotel: {
            id: hotel.id,
            nome_hotel: hotel.nome_hotel,
            nome_fantasia: hotel.nome_fantasia,
            cnpj: hotel.cnpj,
          },
          message: user.first_name
            ? `Seja bem-vindo, ${user.first_name}!`
            : 'Bem-vindo!',
        })
      } catch (error) {
        if (
          error instanceof UserNotFoundError ||
          error instanceof InvalidCredentialsError
        ) {
          return reply.status(401).send({ message: 'Credenciais inválidas' })
        }

        return reply.status(500).send({ message: 'Erro interno do servidor' })
      }
    },
  )
}
