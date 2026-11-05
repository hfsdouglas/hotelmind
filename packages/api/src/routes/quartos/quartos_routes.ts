import { z } from 'zod'
import {
  CategoriaQuartoInativaError,
  QuartoConflictError,
  QuartoNotFoundError,
} from '@/core/errors/quarto_errors'
import { PostgresCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository'
import { PostgresQuartoRepository } from '@/core/repositories/quartos/implementation/postgres_quarto_repository'
import { AtualizarQuartoUseCase } from '@/core/usecases/quartos/atualizar_quarto_use_case'
import { CriarQuartoUseCase } from '@/core/usecases/quartos/criar_quarto_use_case'
import { ListarQuartosUseCase } from '@/core/usecases/quartos/listar_quartos_use_case'
import { db } from '@/lib/prisma'
import {
  create_quarto_body_schema,
  error_response_schema,
  list_quartos_query_schema,
  list_quartos_response_schema,
  quarto_response_schema,
  update_quarto_body_schema,
} from '@/schemas/quartos/quartos_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function quartos_routes(app: FastifyTypedInstance) {
  const quartos = new PostgresQuartoRepository(db)
  const categorias = new PostgresCategoriaQuartoRepository(db)
  const create_use_case = new CriarQuartoUseCase(quartos, categorias)
  const list_use_case = new ListarQuartosUseCase(quartos)
  const update_use_case = new AtualizarQuartoUseCase(quartos, categorias)

  app.get(
    '/quartos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Quartos'],
        querystring: list_quartos_query_schema,
        response: {
          200: list_quartos_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      return reply
        .status(200)
        .send(await list_use_case.execute(request.user.hotelId, request.query))
    }
  )

  app.post(
    '/quartos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Quartos'],
        body: create_quarto_body_schema,
        response: {
          201: quarto_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.status(201).send(
          await create_use_case.execute({
            ...request.body,
            hotel_id: request.user.hotelId,
          })
        )
      } catch (error) {
        if (error instanceof CategoriaQuartoInativaError)
          return reply.status(404).send({ message: error.message })
        if (error instanceof QuartoConflictError)
          return reply.status(409).send({ message: error.message })
        throw error
      }
    }
  )

  app.get(
    '/quartos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Quartos'],
        params: z.object({ id: z.string() }),
        response: {
          200: quarto_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      const room = await quartos.find_by_id(
        request.params.id,
        request.user.hotelId
      )
      if (!room)
        return reply
          .status(404)
          .send({ message: new QuartoNotFoundError().message })
      return reply.status(200).send(room)
    }
  )

  app.put(
    '/quartos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Quartos'],
        params: z.object({ id: z.string() }),
        body: update_quarto_body_schema,
        response: {
          200: quarto_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.status(200).send(
          await update_use_case.execute({
            ...request.body,
            id: request.params.id,
            hotel_id: request.user.hotelId,
          })
        )
      } catch (error) {
        if (
          error instanceof CategoriaQuartoInativaError ||
          error instanceof QuartoNotFoundError
        )
          return reply.status(404).send({ message: error.message })
        if (error instanceof QuartoConflictError)
          return reply.status(409).send({ message: error.message })
        throw error
      }
    }
  )
}
