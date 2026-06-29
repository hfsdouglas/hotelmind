import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresAdminRotaRepository } from '@/db/repositories/admin/implementation/postgres_admin_rota_repository'
import {
  admin_rota_body_schema,
  admin_rota_update_schema,
  admin_rotas_list_schema,
  admin_rota_response_schema,
  admin_error_schema,
} from '@/schemas/admin/admin_rotas_schema'

const pagination_query = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).default('asc'),
})

export async function admin_rotas_routes(app: FastifyTypedInstance) {
  const rotaRepo = new PostgresAdminRotaRepository(db)

  app.get(
    '/admin/rotas',
    {
      onRequest: [app.authenticateAdmin],
      schema: {
        tags: ['Admin - Rotas'],
        summary: 'Listar rotas',
        querystring: pagination_query,
        response: { 200: admin_rotas_list_schema },
      },
    },
    async (request, reply) => {
      const result = await rotaRepo.list(request.query)
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
        body: admin_rota_body_schema,
        response: { 201: admin_rota_response_schema, 409: admin_error_schema },
      },
    },
    async (request, reply) => {
      try {
        const rota = await rotaRepo.create(request.body)
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
        response: { 200: admin_rota_response_schema, 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const rota = await rotaRepo.findById(request.params.id)
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
        body: admin_rota_update_schema,
        response: { 200: admin_rota_response_schema, 404: admin_error_schema },
      },
    },
    async (request, reply) => {
      const rota = await rotaRepo.findById(request.params.id)
      if (!rota) return reply.status(404).send({ message: 'Rota não encontrada.' })
      const updated = await rotaRepo.update(request.params.id, request.body)
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
        response: { 204: z.null(), 404: admin_error_schema, 409: admin_error_schema },
      },
    },
    async (request, reply) => {
      const rota = await rotaRepo.findById(request.params.id)
      if (!rota) return reply.status(404).send({ message: 'Rota não encontrada.' })
      try {
        await rotaRepo.delete(request.params.id)
        return reply.status(204).send(null)
      } catch {
        return reply.status(409).send({ message: 'Rota vinculada a hotéis ou grupos. Remova os vínculos antes.' })
      }
    },
  )
}
