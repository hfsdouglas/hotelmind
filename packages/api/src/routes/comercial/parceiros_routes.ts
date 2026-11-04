import { z } from 'zod'
import type { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import {
  ParceiroComercialConflictError,
  ParceiroComercialNotFoundError,
  ParceiroComercialValidationError,
} from '@/core/errors/parceiro_comercial_errors'
import { PostgresParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/implementation/postgres_parceiro_comercial_repository'
import { AtualizarStatusParceiroUseCase } from '@/core/usecases/parceiros_comerciais/atualizar_status_parceiro_use_case'
import { BuscarParceiroComercialUseCase } from '@/core/usecases/parceiros_comerciais/buscar_parceiro_comercial_use_case'
import { CriarParceiroComercialUseCase } from '@/core/usecases/parceiros_comerciais/criar_parceiro_comercial_use_case'
import { EditarParceiroComercialUseCase } from '@/core/usecases/parceiros_comerciais/editar_parceiro_comercial_use_case'
import { ExcluirParceiroComercialUseCase } from '@/core/usecases/parceiros_comerciais/excluir_parceiro_comercial_use_case'
import { ListarParceirosComerciaisUseCase } from '@/core/usecases/parceiros_comerciais/listar_parceiros_comerciais_use_case'
import { db } from '@/lib/prisma'
import {
  create_parceiro_body_schema,
  error_response_schema,
  list_parceiros_query_schema,
  list_parceiros_response_schema,
  parceiro_params_schema,
  parceiro_response_schema,
  update_parceiro_body_schema,
  update_status_parceiro_body_schema,
} from '@/schemas/comercial/parceiros_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

function parceiro_to_response(p: ParceiroComercial) {
  return {
    id: p.id,
    hotel_id: p.hotel_id,
    tipo_parceiro: p.tipo_parceiro,
    tipo_pessoa: p.tipo_pessoa,
    razao_social: p.razao_social,
    nome_fantasia: p.nome_fantasia,
    documento: p.documento,
    inscricao_estadual: p.inscricao_estadual,
    estrangeiro: p.estrangeiro,
    cadastur: p.cadastur,
    codigo_iata: p.codigo_iata,
    registro_embratur: p.registro_embratur,

    logradouro: p.logradouro,
    numero: p.numero,
    complemento: p.complemento,
    bairro: p.bairro,
    cidade: p.cidade,
    estado: p.estado,
    cep: p.cep,
    pais: p.pais,

    modelo_tarifario: p.modelo_tarifario,
    comissao_padrao: p.comissao_padrao.toFixed(2),
    politica_faturamento: p.politica_faturamento,
    prazo_pagamento_dias: p.prazo_pagamento_dias,
    limite_credito: p.limite_credito.toFixed(2),
    allotment_quartos: p.allotment_quartos,

    status: p.status,
    motivo_bloqueio: p.motivo_bloqueio,
    observacoes: p.observacoes,
    criado_em: p.criado_em.toISOString(),
    atualizado_em: p.atualizado_em.toISOString(),

    contatos: p.contatos || [],
  }
}

export async function parceiros_comerciais_routes(app: FastifyTypedInstance) {
  const repo = new PostgresParceiroComercialRepository(db)
  const criar_use_case = new CriarParceiroComercialUseCase(repo)
  const editar_use_case = new EditarParceiroComercialUseCase(repo)
  const listar_use_case = new ListarParceirosComerciaisUseCase(repo)
  const buscar_use_case = new BuscarParceiroComercialUseCase(repo)
  const status_use_case = new AtualizarStatusParceiroUseCase(repo)
  const excluir_use_case = new ExcluirParceiroComercialUseCase(repo)

  // POST /comercial/parceiros
  app.post(
    '/comercial/parceiros',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        body: create_parceiro_body_schema,
        response: {
          201: parceiro_response_schema,
          400: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parceiro = await criar_use_case.execute({
          hotel_id: request.user.hotelId,
          ...request.body,
        })
        return reply.status(201).send(parceiro_to_response(parceiro))
      } catch (error) {
        if (error instanceof ParceiroComercialConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        if (error instanceof ParceiroComercialValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  // GET /comercial/parceiros
  app.get(
    '/comercial/parceiros',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        querystring: list_parceiros_query_schema,
        response: {
          200: list_parceiros_response_schema,
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
        data: result.data.map(parceiro_to_response),
        meta: result.meta,
      })
    }
  )

  // GET /comercial/parceiros/:id
  app.get(
    '/comercial/parceiros/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        params: parceiro_params_schema,
        response: {
          200: parceiro_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parceiro = await buscar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(parceiro_to_response(parceiro))
      } catch (error) {
        if (error instanceof ParceiroComercialNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  // PUT /comercial/parceiros/:id
  app.put(
    '/comercial/parceiros/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        params: parceiro_params_schema,
        body: update_parceiro_body_schema,
        response: {
          200: parceiro_response_schema,
          400: error_response_schema,
          404: error_response_schema,
          409: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parceiro = await editar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
          ...request.body,
        })
        return reply.status(200).send(parceiro_to_response(parceiro))
      } catch (error) {
        if (error instanceof ParceiroComercialNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof ParceiroComercialConflictError) {
          return reply.status(409).send({ message: error.message })
        }
        if (error instanceof ParceiroComercialValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  // PATCH /comercial/parceiros/:id/status
  app.patch(
    '/comercial/parceiros/:id/status',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        params: parceiro_params_schema,
        body: update_status_parceiro_body_schema,
        response: {
          200: parceiro_response_schema,
          400: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parceiro = await status_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
          status: request.body.status,
          motivo_bloqueio: request.body.motivo_bloqueio,
        })
        return reply.status(200).send(parceiro_to_response(parceiro))
      } catch (error) {
        if (error instanceof ParceiroComercialNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof ParceiroComercialValidationError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  // DELETE /comercial/parceiros/:id
  app.delete(
    '/comercial/parceiros/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Comercial - Parceiros'],
        params: parceiro_params_schema,
        response: {
          204: z.null(),
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        await excluir_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(204).send(null)
      } catch (error) {
        if (error instanceof ParceiroComercialNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )
}
