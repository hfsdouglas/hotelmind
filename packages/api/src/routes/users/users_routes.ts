import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/lib/prisma'
import { PostgresUserRepository } from '@/core/repositories/users/implementation/postgres_user_repository'
import { ListUsersUseCase } from '@/core/usecases/users/list_users_use_case'
import { CreateUserUseCase } from '@/core/usecases/users/create_user_use_case'
import { GetUserUseCase } from '@/core/usecases/users/get_user_use_case'
import { UpdateUserUseCase } from '@/core/usecases/users/update_user_use_case'
import { UsuarioNotFoundError, UsuarioConflictError } from '@/core/errors/usuario_errors'
import {
  list_users_query_schema,
  list_users_response_schema,
} from '@/schemas/users/list_users_schema'
import {
  create_user_body_schema,
  update_user_body_schema,
  user_response_schema,
} from '@/schemas/users/create_user_schema'

const error_schema = z.object({ message: z.string() })

export async function users_routes(app: FastifyTypedInstance) {
  const repo = new PostgresUserRepository(db)
  const list_use_case = new ListUsersUseCase(repo)
  const create_use_case = new CreateUserUseCase(repo)
  const get_use_case = new GetUserUseCase(repo)
  const update_use_case = new UpdateUserUseCase(repo)

  app.get(
    '/usuarios',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Usuários'],
        summary: 'Listar usuários',
        querystring: list_users_query_schema,
        response: {
          200: list_users_response_schema,
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
    '/usuarios',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Usuários'],
        summary: 'Criar usuário',
        body: create_user_body_schema,
        response: {
          201: user_response_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const user = await create_use_case.execute({ ...request.body, hotel_id: hotelId })
        return reply.status(201).send(user)
      } catch (err) {
        if (err instanceof UsuarioConflictError) {
          return reply.status(409).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.get(
    '/usuarios/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por ID',
        params: z.object({ id: z.string() }),
        response: {
          200: user_response_schema,
          404: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const user = await get_use_case.execute(request.params.id, hotelId)
        return reply.status(200).send(user)
      } catch (err) {
        if (err instanceof UsuarioNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        throw err
      }
    },
  )

  app.put(
    '/usuarios/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Usuários'],
        summary: 'Atualizar usuário',
        params: z.object({ id: z.string() }),
        body: update_user_body_schema,
        response: {
          200: user_response_schema,
          404: error_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const user = await update_use_case.execute(request.params.id, hotelId, request.body)
        return reply.status(200).send(user)
      } catch (err) {
        if (err instanceof UsuarioNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof UsuarioConflictError) {
          return reply.status(409).send({ message: err.message })
        }
        throw err
      }
    },
  )
}
