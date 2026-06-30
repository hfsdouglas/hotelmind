import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresRouteRepository } from '@/core/repositories/routes/implementation/postgres_route_repository'
import {
  route_body_schema,
  route_update_schema,
  routes_list_schema,
  route_response_schema,
  error_schema,
} from '@/schemas/routes/admin/routes_schema'

const pagination_query = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).default('asc'),
})

export async function admin_routes_routes(app: FastifyTypedInstance) {
  const routeRepo = new PostgresRouteRepository(db)

  app.get(
    '/admin/rotas',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Listar rotas',
        querystring: pagination_query,
        response: { 200: routes_list_schema },
      },
    },
    async (request, reply) => {
      const result = await routeRepo.list(request.query)
      return reply.status(200).send(result)
    },
  )

  app.post(
    '/admin/rotas',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Criar rota',
        body: route_body_schema,
        response: { 201: route_response_schema, 409: error_schema },
      },
    },
    async (request, reply) => {
      try {
        const rota = await routeRepo.create(request.body)
        return reply.status(201).send(rota)
      } catch {
        return reply.status(409).send({ message: 'Erro ao criar rota.' })
      }
    },
  )

  app.get(
    '/admin/rotas/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Buscar rota por ID',
        params: z.object({ id: z.string() }),
        response: { 200: route_response_schema, 404: error_schema },
      },
    },
    async (request, reply) => {
      const rota = await routeRepo.findById(request.params.id)
      if (!rota) return reply.status(404).send({ message: 'Rota não encontrada.' })
      return reply.status(200).send(rota)
    },
  )

  app.put(
    '/admin/rotas/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Atualizar rota',
        params: z.object({ id: z.string() }),
        body: route_update_schema,
        response: { 200: route_response_schema, 404: error_schema },
      },
    },
    async (request, reply) => {
      const rota = await routeRepo.findById(request.params.id)
      if (!rota) return reply.status(404).send({ message: 'Rota não encontrada.' })
      const updated = await routeRepo.update(request.params.id, request.body)
      return reply.status(200).send(updated)
    },
  )

  app.delete(
    '/admin/rotas/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Deletar rota',
        params: z.object({ id: z.string() }),
        response: { 204: z.null(), 404: error_schema, 409: error_schema },
      },
    },
    async (request, reply) => {
      const rota = await routeRepo.findById(request.params.id)
      if (!rota) return reply.status(404).send({ message: 'Rota não encontrada.' })
      try {
        await routeRepo.delete(request.params.id)
        return reply.status(204).send(null)
      } catch {
        return reply
          .status(409)
          .send({ message: 'Rota vinculada a hotéis ou grupos. Remova os vínculos antes.' })
      }
    },
  )
}
