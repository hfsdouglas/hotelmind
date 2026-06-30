import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresGroupRepository } from '@/core/repositories/groups/implementation/postgres_group_repository'
import { ListGroupsUseCase } from '@/core/usecases/groups/list_groups_use_case'
import { CreateGroupUseCase } from '@/core/usecases/groups/create_group_use_case'
import { GetGroupUseCase } from '@/core/usecases/groups/get_group_use_case'
import { UpdateGroupUseCase } from '@/core/usecases/groups/update_group_use_case'
import { DeleteGroupUseCase } from '@/core/usecases/groups/delete_group_use_case'
import { SyncGroupRoutesUseCase } from '@/core/usecases/groups/sync_group_routes_use_case'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoConflictError, GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'
import {
  list_groups_query_schema,
  list_groups_response_schema,
} from '@/schemas/groups/list_groups_schema'
import {
  create_group_body_schema,
  create_group_response_schema,
} from '@/schemas/groups/create_group_schema'
import { update_group_body_schema, sync_routes_body_schema } from '@/schemas/groups/update_group_schema'

const error_schema = z.object({ message: z.string() })

const group_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  grupo: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

const route_schema = z.object({
  id: z.string(),
  modulo: z.string(),
  recurso: z.string(),
  rota: z.string(),
  icone: z.string().nullable(),
  ordem: z.number(),
  ativo: z.boolean(),
})

export async function groups_routes(app: FastifyTypedInstance) {
  const repo = new PostgresGroupRepository(db)
  const list_use_case = new ListGroupsUseCase(repo)
  const create_use_case = new CreateGroupUseCase(repo)
  const get_use_case = new GetGroupUseCase(repo)
  const update_use_case = new UpdateGroupUseCase(repo)
  const delete_use_case = new DeleteGroupUseCase(repo)
  const sync_routes_use_case = new SyncGroupRoutesUseCase(repo)

  app.get(
    '/grupos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Listar grupos',
        querystring: list_groups_query_schema,
        response: {
          200: list_groups_response_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      const { hotelId } = request.user
      const result = await list_use_case.execute(hotelId, request.query)
      return reply.status(200).send(result)
    },
  )

  app.post(
    '/grupos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Criar grupo',
        body: create_group_body_schema,
        response: {
          201: create_group_response_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const grupo = await create_use_case.execute({ ...request.body, hotel_id: hotelId })
        return reply.status(201).send(grupo)
      } catch (err) {
        if (err instanceof GrupoConflictError) {
          return reply.status(409).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.get(
    '/grupos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Buscar grupo por ID',
        params: z.object({ id: z.string() }),
        response: {
          200: group_schema,
          404: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const grupo = await get_use_case.execute(request.params.id, hotelId)
        return reply.status(200).send(grupo)
      } catch (err) {
        if (err instanceof GrupoNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.put(
    '/grupos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Atualizar grupo',
        params: z.object({ id: z.string() }),
        body: update_group_body_schema,
        response: {
          200: group_schema,
          404: error_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const grupo = await update_use_case.execute(request.params.id, hotelId, request.body)
        return reply.status(200).send(grupo)
      } catch (err) {
        if (err instanceof GrupoNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof GrupoConflictError) {
          return reply.status(409).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.delete(
    '/grupos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Deletar grupo',
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
          404: error_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        await delete_use_case.execute(request.params.id, hotelId)
        return reply.status(204).send(null)
      } catch (err) {
        if (err instanceof GrupoNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof GrupoLinkedUsersError) {
          return reply.status(409).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.get(
    '/grupos/:id/rotas',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Listar rotas do grupo',
        params: z.object({ id: z.string() }),
        response: {
          200: z.array(route_schema),
          404: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const grupo = await get_use_case.execute(request.params.id, hotelId)
        const rotas = await repo.listRoutes(grupo.id)
        return reply.status(200).send(rotas)
      } catch (err) {
        if (err instanceof GrupoNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.put(
    '/grupos/:id/rotas',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Sincronizar rotas do grupo',
        params: z.object({ id: z.string() }),
        body: sync_routes_body_schema,
        response: {
          200: z.array(route_schema),
          404: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const rotas = await sync_routes_use_case.execute(
          request.params.id,
          hotelId,
          request.body.rota_ids,
        )
        return reply.status(200).send(rotas)
      } catch (err) {
        if (err instanceof GrupoNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        throw err
      }
    },
  )
}
