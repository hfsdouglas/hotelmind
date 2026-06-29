import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresAdminHotelRepository } from '@/db/repositories/admin/implementation/postgres_admin_hotel_repository'
import { PostgresAdminRotaRepository } from '@/db/repositories/admin/implementation/postgres_admin_rota_repository'
import {
  admin_hotel_body_schema,
  admin_hotel_update_schema,
  admin_hoteis_list_schema,
  admin_hotel_response_schema,
  admin_error_schema,
} from '@/schemas/admin/admin_hoteis_schema'
import {
  admin_hotel_rotas_response_schema,
  admin_hotel_rotas_body_schema,
} from '@/schemas/admin/admin_rotas_schema'

const pagination_query = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).default('asc'),
})

export async function admin_hoteis_routes(app: FastifyTypedInstance) {
  const hotelRepo = new PostgresAdminHotelRepository(db)
  const rotaRepo = new PostgresAdminRotaRepository(db)

  app.get(
    '/admin/hoteis',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Hotéis'],
        summary: 'Listar hotéis',
        querystring: pagination_query,
        response: { 200: admin_hoteis_list_schema },
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
        body: admin_hotel_body_schema,
        response: { 201: admin_hotel_response_schema, 409: admin_error_schema },
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
        response: { 200: admin_hotel_response_schema, 404: admin_error_schema },
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
        body: admin_hotel_update_schema,
        response: { 200: admin_hotel_response_schema, 404: admin_error_schema },
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
        response: { 204: z.null(), 404: admin_error_schema },
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
        response: { 200: admin_hotel_rotas_response_schema, 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      const rotas = await rotaRepo.findHotelRotas(request.params.id)
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
        body: admin_hotel_rotas_body_schema,
        response: { 204: z.null(), 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const hotel = await hotelRepo.findById(request.params.id)
      if (!hotel) return reply.status(404).send({ message: 'Hotel não encontrado.' })
      await rotaRepo.setHotelRotas(request.params.id, request.body.rota_ids)
      return reply.status(204).send(null)
    },
  )
}
