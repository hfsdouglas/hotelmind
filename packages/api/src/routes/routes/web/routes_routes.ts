import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresRouteRepository } from '@/core/repositories/routes/implementation/postgres_route_repository'

const error_schema = z.object({ message: z.string() })

const route_schema = z.object({
  id: z.string(),
  modulo: z.string(),
  recurso: z.string(),
  rota: z.string(),
  icone: z.string().nullable(),
  ordem: z.number(),
  ativo: z.boolean(),
})

export async function routes_routes(app: FastifyTypedInstance) {
  const repo = new PostgresRouteRepository(db)

  app.get(
    '/rotas',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Rotas'],
        summary: 'Listar rotas ativas do hotel',
        response: {
          200: z.array(route_schema),
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      const { hotelId } = request.user
      const rotas = await repo.findByHotel(hotelId)
      return reply.status(200).send(rotas)
    },
  )
}
