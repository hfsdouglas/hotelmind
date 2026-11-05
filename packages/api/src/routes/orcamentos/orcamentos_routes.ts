import { z } from 'zod'
import type { Orcamento } from '@/core/entities/orcamento'
import { CategoriaQuartoNotFoundError } from '@/core/errors/categoria_quarto_errors'
import {
  LeadNotFoundError,
  LeadValidationError,
} from '@/core/errors/lead_errors'
import {
  OrcamentoNotFoundError,
  OrcamentoValidationError,
} from '@/core/errors/orcamento_errors'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import { RegimeAlimentacaoNotFoundError } from '@/core/errors/regime_alimentacao_errors'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import { PostgresCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/implementation/postgres_categoria_quarto_repository'
import { PostgresLeadRepository } from '@/core/repositories/leads/implementation/postgres_lead_repository'
import { PostgresOrcamentoRepository } from '@/core/repositories/orcamentos/implementation/postgres_orcamento_repository'
import { PostgresRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/implementation/postgres_regime_alimentacao_repository'
import { PostgresTarifarioRepository } from '@/core/repositories/tarifarios/implementation/postgres_tarifario_repository'
import { BuscarOrcamentoPublicoUseCase } from '@/core/usecases/orcamentos/buscar_orcamento_publico_use_case'
import { BuscarOrcamentoUseCase } from '@/core/usecases/orcamentos/buscar_orcamento_use_case'
import { CriarOrcamentoUseCase } from '@/core/usecases/orcamentos/criar_orcamento_use_case'
import { EditarOrcamentoUseCase } from '@/core/usecases/orcamentos/editar_orcamento_use_case'
import { ExcluirOrcamentoUseCase } from '@/core/usecases/orcamentos/excluir_orcamento_use_case'
import { ListarOrcamentosUseCase } from '@/core/usecases/orcamentos/listar_orcamentos_use_case'
import { db } from '@/lib/prisma'
import {
  create_orcamento_body_schema,
  error_response_schema,
  list_orcamentos_query_schema,
  list_orcamentos_response_schema,
  orcamento_params_schema,
  orcamento_publico_params_schema,
  orcamento_publico_response_schema,
  orcamento_response_schema,
  update_orcamento_body_schema,
} from '@/schemas/orcamentos/orcamentos_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

function orcamento_to_response(o: Orcamento) {
  return {
    id: o.id,
    hotel_id: o.hotel_id,
    lead_id: o.lead_id,
    regime_alimentacao_id: o.regime_alimentacao_id,
    categoria_quarto_id: o.categoria_quarto_id,
    check_in: o.check_in,
    check_out: o.check_out,
    quantidade_adultos: o.quantidade_adultos,
    quantidade_criancas: o.quantidade_criancas,
    quantidade_pets: o.quantidade_pets,
    valor_total: o.valor_total,
    detalhamento_noites: o.detalhamento_noites,
    token_publico: o.token_publico,
    status: o.status,
    observacoes: o.observacoes,
    cupom_desconto: o.cupom_desconto,
    lead: o.lead,
    regime_alimentacao: o.regime_alimentacao,
    categoria_quarto: o.categoria_quarto,
    criado_em: o.created_at.toISOString(),
    atualizado_em: o.updated_at.toISOString(),
  }
}

export async function orcamentos_routes(app: FastifyTypedInstance) {
  const orcamentos_repo = new PostgresOrcamentoRepository(db)
  const leads_repo = new PostgresLeadRepository(db)
  const regimes_repo = new PostgresRegimeAlimentacaoRepository(db)
  const categorias_repo = new PostgresCategoriaQuartoRepository(db)
  const tarifarios_repo = new PostgresTarifarioRepository(db)

  const criar_use_case = new CriarOrcamentoUseCase(
    orcamentos_repo,
    leads_repo,
    regimes_repo,
    categorias_repo,
    tarifarios_repo
  )
  const buscar_use_case = new BuscarOrcamentoUseCase(orcamentos_repo)
  const buscar_publico_use_case = new BuscarOrcamentoPublicoUseCase(
    orcamentos_repo
  )
  const listar_use_case = new ListarOrcamentosUseCase(orcamentos_repo)
  const editar_use_case = new EditarOrcamentoUseCase(
    orcamentos_repo,
    regimes_repo,
    categorias_repo,
    tarifarios_repo,
    leads_repo
  )
  const excluir_use_case = new ExcluirOrcamentoUseCase(orcamentos_repo)

  // ROTA PÚBLICA (Sem middleware de autenticação)
  app.get(
    '/orcamentos/publico/:token',
    {
      schema: {
        tags: ['Orçamentos Públicos'],
        params: orcamento_publico_params_schema,
        response: {
          200: orcamento_publico_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await buscar_publico_use_case.execute(
          request.params.token
        )
        return reply.status(200).send(result)
      } catch (error) {
        if (error instanceof OrcamentoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  // ROTAS ADMINISTRATIVAS (Autenticadas)
  app.get(
    '/orcamentos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orçamentos'],
        querystring: list_orcamentos_query_schema,
        response: {
          200: list_orcamentos_response_schema,
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
        data: result.data.map(orcamento_to_response),
        meta: result.meta,
      })
    }
  )

  app.post(
    '/orcamentos',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orçamentos'],
        body: create_orcamento_body_schema,
        response: {
          201: orcamento_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const orcamento = await criar_use_case.execute({
          hotel_id: request.user.hotelId,
          ...request.body,
        })

        return reply.status(201).send(orcamento_to_response(orcamento))
      } catch (error) {
        if (
          error instanceof OrcamentoValidationError ||
          error instanceof LeadValidationError ||
          error instanceof TarifarioSemCoberturaError
        ) {
          return reply.status(400).send({ message: error.message })
        }
        if (
          error instanceof LeadNotFoundError ||
          error instanceof RegimeAlimentacaoNotFoundError ||
          error instanceof CategoriaQuartoNotFoundError
        ) {
          return reply.status(404).send({ message: error.message })
        }
        if (error instanceof CategoriaQuartoInativaError) {
          return reply.status(400).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.get(
    '/orcamentos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orçamentos'],
        params: orcamento_params_schema,
        response: {
          200: orcamento_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const orcamento = await buscar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(orcamento_to_response(orcamento))
      } catch (error) {
        if (error instanceof OrcamentoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.put(
    '/orcamentos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orçamentos'],
        params: orcamento_params_schema,
        body: update_orcamento_body_schema,
        response: {
          200: orcamento_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const updated = await editar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
          ...request.body,
        })
        return reply.status(200).send(orcamento_to_response(updated))
      } catch (error) {
        if (
          error instanceof OrcamentoValidationError ||
          error instanceof TarifarioSemCoberturaError ||
          error instanceof CategoriaQuartoInativaError
        ) {
          return reply.status(400).send({ message: error.message })
        }
        if (
          error instanceof OrcamentoNotFoundError ||
          error instanceof RegimeAlimentacaoNotFoundError ||
          error instanceof CategoriaQuartoNotFoundError
        ) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )

  app.delete(
    '/orcamentos/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orçamentos'],
        params: orcamento_params_schema,
        response: {
          204: z.null(),
          401: error_response_schema,
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
        if (error instanceof OrcamentoNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }
        throw error
      }
    }
  )
}
