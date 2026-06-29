import { z } from 'zod'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@/db/client'
import { PostgresUsuarioRepository } from '@/db/repositories/usuarios/implementation/postgres_usuario_repository'
import { ListUsuariosUseCase } from '@/core/usecases/usuarios/list_usuarios_use_case'
import { CreateUsuarioUseCase } from '@/core/usecases/usuarios/create_usuario_use_case'
import { GetUsuarioUseCase } from '@/core/usecases/usuarios/get_usuario_use_case'
import { UpdateUsuarioUseCase } from '@/core/usecases/usuarios/update_usuario_use_case'
import { UsuarioNotFoundError, UsuarioConflictError } from '@/core/errors/usuario_errors'
import {
  list_usuarios_query_schema,
  list_usuarios_response_schema,
} from '@/schemas/usuarios/list_usuarios_schema'
import {
  create_usuario_body_schema,
  update_usuario_body_schema,
  usuario_response_schema,
} from '@/schemas/usuarios/create_usuario_schema'

const error_schema = z.object({ message: z.string() })

export async function usuarios_routes(app: FastifyTypedInstance) {
  const repo = new PostgresUsuarioRepository(db)
  const list_use_case = new ListUsuariosUseCase(repo)
  const create_use_case = new CreateUsuarioUseCase(repo)
  const get_use_case = new GetUsuarioUseCase(repo)
  const update_use_case = new UpdateUsuarioUseCase(repo)

  app.get(
    '/usuarios',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Usuários'],
        summary: 'Listar usuários',
        querystring: list_usuarios_query_schema,
        response: {
          200: list_usuarios_response_schema,
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
        body: create_usuario_body_schema,
        response: {
          201: usuario_response_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const usuario = await create_use_case.execute({ ...request.body, hotel_id: hotelId })
        return reply.status(201).send(usuario)
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
          200: usuario_response_schema,
          404: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const usuario = await get_use_case.execute(request.params.id, hotelId)
        return reply.status(200).send(usuario)
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
        body: update_usuario_body_schema,
        response: {
          200: usuario_response_schema,
          404: error_schema,
          409: error_schema,
          401: error_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { hotelId } = request.user
        const usuario = await update_use_case.execute(request.params.id, hotelId, request.body)
        return reply.status(200).send(usuario)
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
