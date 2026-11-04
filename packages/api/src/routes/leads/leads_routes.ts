import {
  LeadNotFoundError,
  LeadValidationError,
} from '@/core/errors/lead_errors'
import { PostgresLeadRepository } from '@/core/repositories/leads/implementation/postgres_lead_repository'
import { BuscarLeadUseCase } from '@/core/usecases/leads/buscar_lead_use_case'
import { CriarLeadUseCase } from '@/core/usecases/leads/criar_lead_use_case'
import { ListarLeadsUseCase } from '@/core/usecases/leads/listar_leads_use_case'
import { db } from '@/lib/prisma'
import {
  create_lead_body_schema,
  error_response_schema,
  lead_params_schema,
  lead_response_schema,
  list_leads_query_schema,
  list_leads_response_schema,
} from '@/schemas/leads/leads_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function leads_routes(app: FastifyTypedInstance) {
  const repository = new PostgresLeadRepository(db)
  const criar_use_case = new CriarLeadUseCase(repository)
  const buscar_use_case = new BuscarLeadUseCase(repository)
  const listar_use_case = new ListarLeadsUseCase(repository)

  app.get(
    '/leads',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Leads'],
        querystring: list_leads_query_schema,
        response: {
          200: list_leads_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      const result = await listar_use_case.execute({
        hotel_id: request.user.hotelId,
        ...request.query,
      })

      return reply.status(200).send({
        data: result.data.map(lead => ({
          id: lead.id,
          hotel_id: lead.hotel_id,
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email,
          criado_em: lead.created_at.toISOString(),
          atualizado_em: lead.updated_at.toISOString(),
        })),
        meta: result.meta,
      })
    }
  )

  app.post(
    '/leads',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Leads'],
        body: create_lead_body_schema,
        response: {
          201: lead_response_schema,
          400: error_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const lead = await criar_use_case.execute({
          hotel_id: request.user.hotelId,
          ...request.body,
        })

        return reply.status(201).send({
          id: lead.id,
          hotel_id: lead.hotel_id,
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email,
          criado_em: lead.created_at.toISOString(),
          atualizado_em: lead.updated_at.toISOString(),
        })
      } catch (error) {
        if (error instanceof LeadValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.get(
    '/leads/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Leads'],
        params: lead_params_schema,
        response: {
          200: lead_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const lead = await buscar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })

        return reply.status(200).send({
          id: lead.id,
          hotel_id: lead.hotel_id,
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email,
          criado_em: lead.created_at.toISOString(),
          atualizado_em: lead.updated_at.toISOString(),
        })
      } catch (error) {
        if (error instanceof LeadNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )
}
