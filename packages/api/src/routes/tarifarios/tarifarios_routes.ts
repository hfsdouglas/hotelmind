import { z } from 'zod'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioNotFoundError,
  TarifarioPeriodConflictError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'
import { PostgresCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository'
import { PostgresTarifarioRepository } from '@/core/repositories/tarifarios/implementation/postgres_tarifario_repository'
import { AtivarTarifarioUseCase } from '@/core/usecases/tarifarios/ativar_tarifario_use_case'
import { BuscarTarifarioUseCase } from '@/core/usecases/tarifarios/buscar_tarifario_use_case'
import { ConsultarPeriodosTarifariosUseCase } from '@/core/usecases/tarifarios/consultar_periodos_tarifarios_use_case'
import { CriarTarifarioUseCase } from '@/core/usecases/tarifarios/criar_tarifario_use_case'
import { DesativarTarifarioUseCase } from '@/core/usecases/tarifarios/desativar_tarifario_use_case'
import { EditarTarifarioUseCase } from '@/core/usecases/tarifarios/editar_tarifario_use_case'
import { ListarTarifariosUseCase } from '@/core/usecases/tarifarios/listar_tarifarios_use_case'
import { db } from '@/lib/prisma'
import {
  calendario_tarifarios_query_schema,
  calendario_tarifarios_response_schema,
  create_tarifario_body_schema,
  error_response_schema,
  list_tarifarios_query_schema,
  list_tarifarios_response_schema,
  tarifario_response_schema,
  update_tarifario_body_schema,
} from '@/schemas/tarifarios/tarifarios_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function tarifarios_routes(app: FastifyTypedInstance) {
  const tarifarios = new PostgresTarifarioRepository(db)
  const categorias = new PostgresCategoriaQuartoRepository(db)

  const listar_use_case = new ListarTarifariosUseCase(tarifarios)
  const buscar_use_case = new BuscarTarifarioUseCase(tarifarios)
  const criar_use_case = new CriarTarifarioUseCase(tarifarios, categorias)
  const editar_use_case = new EditarTarifarioUseCase(tarifarios, categorias)
  const ativar_use_case = new AtivarTarifarioUseCase(tarifarios)
  const desativar_use_case = new DesativarTarifarioUseCase(tarifarios)
  const consultar_calendario_use_case = new ConsultarPeriodosTarifariosUseCase(
    tarifarios,
    categorias
  )

  app.get(
    '/tarifarios',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        querystring: list_tarifarios_query_schema,
        response: {
          200: list_tarifarios_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      return reply
        .status(200)
        .send(
          await listar_use_case.execute(request.user.hotelId, request.query)
        )
    }
  )

  app.get(
    '/tarifarios/calendario',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        querystring: calendario_tarifarios_query_schema,
        response: {
          200: calendario_tarifarios_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.status(200).send(
          await consultar_calendario_use_case.execute({
            hotel_id: request.user.hotelId,
            categoria_quarto_id: request.query.categoria_quarto_id,
            data_inicio: request.query.data_inicio,
            data_fim: request.query.data_fim,
          })
        )
      } catch (error) {
        if (error instanceof CategoriaQuartoInativaError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.get(
    '/tarifarios/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        params: z.object({ id: z.string() }),
        response: {
          200: tarifario_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply
          .status(200)
          .send(
            await buscar_use_case.execute(
              request.params.id,
              request.user.hotelId
            )
          )
      } catch (error) {
        if (error instanceof TarifarioNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.post(
    '/tarifarios',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        body: create_tarifario_body_schema,
        response: {
          201: tarifario_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.status(201).send(
          await criar_use_case.execute({
            ...request.body,
            hotel_id: request.user.hotelId,
          })
        )
      } catch (error) {
        if (error instanceof TarifarioValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        if (error instanceof CategoriaQuartoInativaError) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof TarifarioPeriodConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.patch(
    '/tarifarios/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        params: z.object({ id: z.string() }),
        body: update_tarifario_body_schema,
        response: {
          200: tarifario_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply.status(200).send(
          await editar_use_case.execute({
            ...request.body,
            id: request.params.id,
            hotel_id: request.user.hotelId,
          })
        )
      } catch (error) {
        if (error instanceof TarifarioValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        if (
          error instanceof TarifarioNotFoundError ||
          error instanceof CategoriaQuartoInativaError
        ) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof TarifarioPeriodConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.patch(
    '/tarifarios/:id/ativar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        params: z.object({ id: z.string() }),
        response: {
          200: tarifario_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply
          .status(200)
          .send(
            await ativar_use_case.execute(
              request.params.id,
              request.user.hotelId
            )
          )
      } catch (error) {
        if (error instanceof TarifarioNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof TarifarioPeriodConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.patch(
    '/tarifarios/:id/desativar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Tarifários'],
        params: z.object({ id: z.string() }),
        response: {
          200: tarifario_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        return reply
          .status(200)
          .send(
            await desativar_use_case.execute(
              request.params.id,
              request.user.hotelId
            )
          )
      } catch (error) {
        if (error instanceof TarifarioNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )
}
