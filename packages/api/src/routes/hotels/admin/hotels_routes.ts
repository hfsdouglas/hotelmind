import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresHotelRepository } from '@/core/repositories/hotels/implementation/postgres_hotel_repository'
import { PostgresRouteRepository } from '@/core/repositories/routes/implementation/postgres_route_repository'
import {
  hotel_body_schema,
  hotel_update_schema,
  hotels_list_schema,
  hotel_response_schema,
  error_schema,
} from '@/schemas/hotels/admin/hotels_schema'
import {
  hotel_routes_response_schema,
  hotel_routes_body_schema,
} from '@/schemas/routes/admin/routes_schema'

const pagination_query = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).default('asc'),
})

export async function admin_hotels_routes(app: FastifyTypedInstance) {
  const hotelRepo = new PostgresHotelRepository(db)
  const routeRepo = new PostgresRouteRepository(db)

  app.get(
    '/admin/hoteis',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Listar hotéis',
        querystring: pagination_query,
        response: { 200: hotels_list_schema },
      },
    },
    async (request, reply) => {
      const result = await hotelRepo.list(request.query)
      return reply.status(200).send(result)
    },
  )

  app.post(
    '/admin/hoteis',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Criar hotel',
        body: hotel_body_schema,
        response: { 201: hotel_response_schema, 409: error_schema },
      },
    },
    async (request, reply) => {
      try {
        const hotel = await hotelRepo.create(request.body)
        return reply.status(201).send(hotel)
      } catch {
        return reply.status(409).send({ message: 'CNPJ ou e-mail já cadastrado.' })
      }
    },
  )

  app.get(
    '/admin/hoteis/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Buscar hotel por ID',
        params: z.object({ id: z.string() }),
        response: { 200: hotel_response_schema, 404: error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      return reply.status(200).send(hotel)
    },
  )

  app.put(
    '/admin/hoteis/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Atualizar hotel',
        params: z.object({ id: z.string() }),
        body: hotel_update_schema,
        response: { 200: hotel_response_schema, 404: error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      const updated = await hotelRepo.update(request.params.id, request.body)
      return reply.status(200).send(updated)
    },
  )

  app.delete(
    '/admin/hoteis/:id',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Deletar hotel',
        params: z.object({ id: z.string() }),
        response: { 204: z.null(), 404: error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      await hotelRepo.delete(request.params.id)
      return reply.status(204).send(null)
    },
  )

  app.get(
    '/admin/hoteis/:id/rotas',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Listar rotas do hotel',
        params: z.object({ id: z.string() }),
        response: { 200: hotel_routes_response_schema, 404: error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      const rotas = await routeRepo.findHotelRoutes(request.params.id)
      return reply.status(200).send(rotas)
    },
  )

  app.put(
    '/admin/hoteis/:id/rotas',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Atualizar rotas do hotel',
        params: z.object({ id: z.string() }),
        body: hotel_routes_body_schema,
        response: { 204: z.null(), 404: error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      await routeRepo.setHotelRoutes(request.params.id, request.body.rota_ids)
      return reply.status(204).send(null)
    },
  )
}
