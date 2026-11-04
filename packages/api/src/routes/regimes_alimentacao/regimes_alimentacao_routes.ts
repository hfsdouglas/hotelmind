import { z } from 'zod'
import {
  RegimeAlimentacaoConflictError,
  RegimeAlimentacaoNotFoundError,
  RegimeAlimentacaoValidationError,
} from '@/core/errors/regime_alimentacao_errors'
import { PostgresRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/implementation/postgres_regime_alimentacao_repository'
import { AtivarRegimeAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/ativar_regime_alimentacao_use_case'
import { BuscarRegimeAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/buscar_regime_alimentacao_use_case'
import { CriarRegimeAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/criar_regime_alimentacao_use_case'
import { DesativarRegimeAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/desativar_regime_alimentacao_use_case'
import { EditarRegimeAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/editar_regime_alimentacao_use_case'
import { ListarRegimesAlimentacaoUseCase } from '@/core/usecases/regimes_alimentacao/listar_regimes_alimentacao_use_case'
import { db } from '@/lib/prisma'
import {
  create_regime_alimentacao_body_schema,
  error_response_schema,
  list_regimes_alimentacao_query_schema,
  list_regimes_alimentacao_response_schema,
  regime_alimentacao_response_schema,
  update_regime_alimentacao_body_schema,
} from '@/schemas/regimes_alimentacao/regimes_alimentacao_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function regimes_alimentacao_routes(app: FastifyTypedInstance) {
  const repository = new PostgresRegimeAlimentacaoRepository(db)
  const listar_use_case = new ListarRegimesAlimentacaoUseCase(repository)
  const buscar_use_case = new BuscarRegimeAlimentacaoUseCase(repository)
  const criar_use_case = new CriarRegimeAlimentacaoUseCase(repository)
  const editar_use_case = new EditarRegimeAlimentacaoUseCase(repository)
  const ativar_use_case = new AtivarRegimeAlimentacaoUseCase(repository)
  const desativar_use_case = new DesativarRegimeAlimentacaoUseCase(repository)

  app.get(
    '/regimes_alimentacao',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        querystring: list_regimes_alimentacao_query_schema,
        response: {
          200: list_regimes_alimentacao_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      const result = await listar_use_case.execute({
        hotel_id: request.user.hotelId,
        ...request.query,
      })
      return reply.status(200).send(result)
    }
  )

  app.post(
    '/regimes_alimentacao',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        body: create_regime_alimentacao_body_schema,
        response: {
          201: regime_alimentacao_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const regime = await criar_use_case.execute({
          hotel_id: request.user.hotelId,
          ...request.body,
        })
        return reply.status(201).send(regime)
      } catch (error) {
        if (error instanceof RegimeAlimentacaoConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        if (error instanceof RegimeAlimentacaoValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.get(
    '/regimes_alimentacao/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        params: z.object({ id: z.string() }),
        response: {
          200: regime_alimentacao_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const regime = await buscar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(regime)
      } catch (error) {
        if (error instanceof RegimeAlimentacaoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.put(
    '/regimes_alimentacao/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        params: z.object({ id: z.string() }),
        body: update_regime_alimentacao_body_schema,
        response: {
          200: regime_alimentacao_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const regime = await editar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
          ...request.body,
        })
        return reply.status(200).send(regime)
      } catch (error) {
        if (error instanceof RegimeAlimentacaoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof RegimeAlimentacaoConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        if (error instanceof RegimeAlimentacaoValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.patch(
    '/regimes_alimentacao/:id/ativar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        params: z.object({ id: z.string() }),
        response: {
          200: regime_alimentacao_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const regime = await ativar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(regime)
      } catch (error) {
        if (error instanceof RegimeAlimentacaoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.patch(
    '/regimes_alimentacao/:id/desativar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Regimes de Alimentação'],
        params: z.object({ id: z.string() }),
        response: {
          200: regime_alimentacao_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const regime = await desativar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(regime)
      } catch (error) {
        if (error instanceof RegimeAlimentacaoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )
}
