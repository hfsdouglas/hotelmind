import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { WEB_APP_URL } from '@/config/env'
import { PostgresHotelRepository } from '@/core/repositories/hotels/implementation/postgres_hotel_repository'
import { PostgresUserRepository } from '@/core/repositories/users/implementation/postgres_user_repository'
import { PostgresRouteRepository } from '@/core/repositories/routes/implementation/postgres_route_repository'
import { CriarSuporteAcessoUseCase } from '@/core/usecases/suporte/criar_suporte_acesso_use_case'
import { HotelNotFoundError } from '@/core/errors/hotel_not_found_error'
import { UserNotFoundError } from '@/core/errors/authentication_error'
import { HotelInactiveError } from '@/core/errors/suporte_errors'
import { suporte_acesso_query_schema } from '@/schemas/suporte/admin/suporte_schema'

function error_page(message: string): string {
  return `<!doctype html><html><body><p>${message}</p></body></html>`
}

export async function admin_suporte_routes(app: FastifyTypedInstance) {
  const hotelRepo = new PostgresHotelRepository(db)
  const userRepo = new PostgresUserRepository(db)
  const routeRepo = new PostgresRouteRepository(db)
  const criar_suporte_acesso_use_case = new CriarSuporteAcessoUseCase(hotelRepo, userRepo, routeRepo)

  app.get(
    '/admin/hoteis/:id/suporte-acesso',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Suporte'],
        summary: 'Gera acesso de suporte a um hotel, autenticado como um usuário escolhido',
        params: z.object({ id: z.string() }),
        querystring: suporte_acesso_query_schema,
      },
    },
    async (request, reply) => {
      try {
        const { user, hotel } = await criar_suporte_acesso_use_case.execute({
          hotelId: request.params.id,
          usuarioId: request.query.usuario_id,
        })

        const token = app.jwt.sign(
          {
            sub: user.id,
            user: {
              hotelId: hotel.id,
              nomecompleto: user.nome_completo,
              email: user.email,
            },
            suporte: {
              administratorId: request.admin!.adminId,
              administratorNome: request.admin!.nomecompleto,
            },
          },
          { expiresIn: '30m' },
        )

        reply.setCookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 30,
        })

        request.log.info(
          {
            administrator_id: request.admin!.adminId,
            hotel_id: hotel.id,
            usuario_id: user.id,
            event: 'suporte_acesso',
          },
          'Suporte access granted',
        )

        return reply.redirect(WEB_APP_URL, 302)
      } catch (error) {
        if (error instanceof HotelNotFoundError || error instanceof UserNotFoundError) {
          return reply.status(404).type('text/html').send(error_page(error.message))
        }
        if (error instanceof HotelInactiveError) {
          return reply.status(409).type('text/html').send(error_page(error.message))
        }
        throw error
      }
    },
  )
}
