import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresGrupoRepository } from '@/db/repositories/grupos/implementation/postgres_grupo_repository'
import { ListGruposUseCase } from '@/core/usecases/grupos/list_grupos_use_case'
import { CreateGrupoUseCase } from '@/core/usecases/grupos/create_grupo_use_case'
import { GetGrupoUseCase } from '@/core/usecases/grupos/get_grupo_use_case'
import { UpdateGrupoUseCase } from '@/core/usecases/grupos/update_grupo_use_case'
import { DeleteGrupoUseCase } from '@/core/usecases/grupos/delete_grupo_use_case'
import { SyncGrupoRoutesUseCase } from '@/core/usecases/grupos/sync_grupo_routes_use_case'
import { GrupoNotFoundError } from '@/core/errors/grupo_not_found_error'
import { GrupoConflictError, GrupoLinkedUsersError } from '@/core/errors/grupo_conflict_error'
import {
  list_grupos_query_schema,
  list_grupos_response_schema,
} from '@/schemas/grupos/list_grupos_schema'
import {
  create_grupo_body_schema,
  create_grupo_response_schema,
} from '@/schemas/grupos/create_grupo_schema'
import { update_grupo_body_schema, sync_routes_body_schema } from '@/schemas/grupos/update_grupo_schema'

const error_schema = z.object({ message: z.string() })

const grupo_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  grupo: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

const rota_schema = z.object({
  id: z.string(),
  modulo: z.string(),
  recurso: z.string(),
  rota: z.string(),
  icone: z.string().nullable(),
  ordem: z.number(),
  ativo: z.boolean(),
})

export async function grupos_routes(app: FastifyTypedInstance) {
  const repo = new PostgresGrupoRepository(db)
  const list_use_case = new ListGruposUseCase(repo)
  const create_use_case = new CreateGrupoUseCase(repo)
  const get_use_case = new GetGrupoUseCase(repo)
  const update_use_case = new UpdateGrupoUseCase(repo)
  const delete_use_case = new DeleteGrupoUseCase(repo)
  const sync_routes_use_case = new SyncGrupoRoutesUseCase(repo)

  app.get(
    '/grupos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Grupos'],
        summary: 'Listar grupos',
        querystring: list_grupos_query_schema,
        response: {
          200: list_grupos_response_schema,
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
        body: create_grupo_body_schema,
        response: {
          201: create_grupo_response_schema,
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
          200: grupo_schema,
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
        body: update_grupo_body_schema,
        response: {
          200: grupo_schema,
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
          200: z.array(rota_schema),
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
          200: z.array(rota_schema),
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
