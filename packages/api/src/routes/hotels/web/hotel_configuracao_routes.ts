import { PostgresHotelConfiguracaoRepository } from '@/core/repositories/hotels/implementation/postgres_hotel_configuracao_repository'
import { GetHotelConfiguracaoUseCase } from '@/core/usecases/hotels/get_hotel_configuracao_use_case'
import { UpdateHotelConfiguracaoUseCase } from '@/core/usecases/hotels/update_hotel_configuracao_use_case'
import { db } from '@/lib/prisma'
import {
  error_response_schema,
  hotel_configuracao_response_schema,
  update_hotel_configuracao_body_schema,
} from '@/schemas/hotels/hotel_configuracao_schemas'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function hotel_configuracao_routes(app: FastifyTypedInstance) {
  app.get(
    '/hoteis/configuracao',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Web - Hotéis'],
        summary: 'Obter configurações do hotel ativo',
        response: {
          200: hotel_configuracao_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      const { hotelId } = request.user
      const repository = new PostgresHotelConfiguracaoRepository(db)
      const useCase = new GetHotelConfiguracaoUseCase(repository)

      try {
        const result = await useCase.execute({ hotelId })
        return reply.status(200).send(result)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao obter configurações'
        return reply.status(404).send({ message })
      }
    }
  )

  app.put(
    '/hoteis/configuracao',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Web - Hotéis'],
        summary: 'Atualizar configurações do hotel ativo',
        body: update_hotel_configuracao_body_schema,
        response: {
          200: hotel_configuracao_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      const { hotelId } = request.user
      const repository = new PostgresHotelConfiguracaoRepository(db)
      const useCase = new UpdateHotelConfiguracaoUseCase(repository)

      try {
        const result = await useCase.execute({
          hotelId,
          data: request.body,
        })
        return reply.status(200).send(result)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao atualizar configurações'
        return reply.status(400).send({ message })
      }
    }
  )
}
