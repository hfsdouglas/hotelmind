import { z } from 'zod'
import type { Reserva } from '@/core/entities/reserva'
import {
  ReservaConflitoError,
  ReservaNotFoundError,
  ReservaTransicaoInvalidaError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import {
  ParceiroComercialRepository,
  QuartoRepository,
  RegimeAlimentacaoRepository,
  ReservaHospedeRepository,
  ReservaRepository,
  TarifarioRepository,
} from '@/core/repositories'
import { AlterarStatusReservaUseCase } from '@/core/usecases/reservas/alterar_status_reserva_use_case'
import { BuscarReservaUseCase } from '@/core/usecases/reservas/buscar_reserva_use_case'
import { ConsultarDisponibilidadeUseCase } from '@/core/usecases/reservas/consultar_disponibilidade_use_case'
import { CriarReservaUseCase } from '@/core/usecases/reservas/criar_reserva_use_case'
import { EditarReservaUseCase } from '@/core/usecases/reservas/editar_reserva_use_case'
import { GerenciarLinkFnrhUseCase } from '@/core/usecases/reservas/gerenciar_link_fnrh_use_case'
import { ListarReservasUseCase } from '@/core/usecases/reservas/listar_reservas_use_case'
import { SalvarFichaHospedeUseCase } from '@/core/usecases/reservas/salvar_ficha_hospede_use_case'
import { db } from '@/lib/prisma'
import {
  change_reserva_status_body_schema,
  conflito_error_response_schema,
  consultar_disponibilidade_query_schema,
  create_reserva_body_schema,
  error_response_schema,
  hospede_response_schema,
  list_reservas_query_schema,
  quarto_disponivel_schema,
  reserva_hospede_params_schema,
  reserva_list_response_schema,
  reserva_params_schema,
  reserva_response_schema,
  save_ficha_body_schema,
  update_reserva_body_schema,
} from '@/schemas/reservas/reservas_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

function reserva_to_response(r: Reserva) {
  return {
    id: r.id,
    hotel_id: r.hotel_id,
    codigo: r.codigo,
    titular_nome: r.titular_nome,
    titular_telefone: r.titular_telefone,
    titular_email: r.titular_email,
    quarto_id: r.quarto_id,
    regime_alimentacao_id: r.regime_alimentacao_id,
    parceiro_comercial_id: r.parceiro_comercial_id,
    check_in: r.check_in,
    check_out: r.check_out,
    quantidade_adultos: r.quantidade_adultos,
    quantidade_criancas: r.quantidade_criancas,
    valor_total: r.valor_total,
    detalhamento_diarias: r.detalhamento_diarias,
    status: r.status,
    token_fnrh_ativo: r.token_fnrh_ativo,
    fnrh_enviada_em: r.fnrh_enviada_em ? r.fnrh_enviada_em.toISOString() : null,
    fichas_preenchidas: r.fichas_preenchidas,
    total_hospedes: r.total_hospedes,
    observacoes: r.observacoes,
    quarto: r.quarto,
    regime_alimentacao: r.regime_alimentacao,
    parceiro_comercial: r.parceiro_comercial,
    hospedes: r.hospedes?.map(h => ({
      id: h.id,
      posicao: h.posicao,
      ficha_status: h.ficha_status,
      preenchido_por: h.preenchido_por,
      preenchido_em: h.preenchido_em ? h.preenchido_em.toISOString() : null,
      nome_completo: h.nome_completo,
      nacionalidade: h.nacionalidade,
      data_nascimento: h.data_nascimento,
      sexo: h.sexo,
      profissao: h.profissao,
      tipo_documento: h.tipo_documento,
      numero_documento: h.numero_documento,
      logradouro: h.logradouro,
      numero_endereco: h.numero_endereco,
      complemento: h.complemento,
      bairro: h.bairro,
      cidade: h.cidade,
      estado: h.estado,
      cep: h.cep,
      pais_residencia: h.pais_residencia,
      telefone: h.telefone,
      email: h.email,
      motivo_viagem: h.motivo_viagem,
      meio_transporte: h.meio_transporte,
      procedencia: h.procedencia,
      proximo_destino: h.proximo_destino,
      responsavel_posicao: h.responsavel_posicao,
    })),
    criado_em: r.created_at.toISOString(),
    atualizado_em: r.updated_at.toISOString(),
  }
}

export async function reservas_routes(app: FastifyTypedInstance) {
  const reservas_repo = new ReservaRepository(db)
  const hospedes_repo = new ReservaHospedeRepository(db)
  const quartos_repo = new QuartoRepository(db)
  const regimes_repo = new RegimeAlimentacaoRepository(db)
  const tarifarios_repo = new TarifarioRepository(db)
  const parceiros_repo = new ParceiroComercialRepository(db)

  const disponibilidade_use_case = new ConsultarDisponibilidadeUseCase(
    reservas_repo,
    quartos_repo,
    tarifarios_repo
  )

  const criar_use_case = new CriarReservaUseCase(
    reservas_repo,
    hospedes_repo,
    quartos_repo,
    regimes_repo,
    tarifarios_repo,
    parceiros_repo,
    undefined,
    disponibilidade_use_case
  )

  const listar_use_case = new ListarReservasUseCase(reservas_repo)
  const buscar_use_case = new BuscarReservaUseCase(reservas_repo)
  const editar_use_case = new EditarReservaUseCase(
    reservas_repo,
    hospedes_repo,
    quartos_repo,
    regimes_repo,
    tarifarios_repo,
    parceiros_repo,
    undefined,
    disponibilidade_use_case
  )
  const alterar_status_use_case = new AlterarStatusReservaUseCase(reservas_repo)
  const salvar_ficha_use_case = new SalvarFichaHospedeUseCase(
    reservas_repo,
    hospedes_repo
  )
  const link_fnrh_use_case = new GerenciarLinkFnrhUseCase(reservas_repo)

  // 1. Consultar disponibilidade
  app.get(
    '/reservas/disponibilidade',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        querystring: consultar_disponibilidade_query_schema,
        response: {
          200: z.array(quarto_disponivel_schema),
          400: error_response_schema,
          401: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const resultado = await disponibilidade_use_case.execute({
          hotel_id: request.user.hotelId,
          ...request.query,
        })
        return reply.status(200).send(resultado)
      } catch (err) {
        if (err instanceof Error) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 2. Listar reservas
  app.get(
    '/reservas',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        querystring: list_reservas_query_schema,
        response: {
          200: reserva_list_response_schema,
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
        data: result.data.map(reserva_to_response),
        meta: {
          total: result.meta.total,
          pagina: result.meta.pagina,
          limite: result.meta.limite,
          ultima_pagina: result.meta.ultima_pagina,
          total_paginas: result.meta.ultima_pagina,
        },
      })
    }
  )

  // 3. Cadastrar reserva
  app.post(
    '/reservas',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        body: create_reserva_body_schema,
        response: {
          201: reserva_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          409: conflito_error_response_schema,
          422: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const reserva = await criar_use_case.execute({
          hotel_id: request.user.hotelId,
          user_id: request.user.sub,
          ...request.body,
        })
        return reply.status(201).send(reserva_to_response(reserva))
      } catch (err) {
        if (err instanceof ReservaConflitoError) {
          return reply.status(409).send({
            message: err.message,
            alternativas: err.alternativas,
          })
        }
        if (err instanceof TarifarioSemCoberturaError) {
          return reply.status(422).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(400).send({ message: err.message })
        }
        if (err instanceof Error) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 4. Detalhes da reserva
  app.get(
    '/reservas/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        params: reserva_params_schema,
        response: {
          200: reserva_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const reserva = await buscar_use_case.execute({
          id: request.params.id,
          hotel_id: request.user.hotelId,
        })
        return reply.status(200).send(reserva_to_response(reserva))
      } catch (err) {
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 5. Editar reserva
  app.put(
    '/reservas/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        params: reserva_params_schema,
        body: update_reserva_body_schema,
        response: {
          200: reserva_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          409: conflito_error_response_schema,
          422: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const updated = await editar_use_case.execute({
          reserva_id: request.params.id,
          hotel_id: request.user.hotelId,
          user_id: request.user.sub,
          dados: request.body,
        })
        return reply.status(200).send(reserva_to_response(updated))
      } catch (err) {
        if (err instanceof ReservaConflitoError) {
          return reply.status(409).send({
            message: err.message,
            alternativas: err.alternativas,
          })
        }
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof TarifarioSemCoberturaError) {
          return reply.status(422).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 6. Alterar status da reserva
  app.patch(
    '/reservas/:id/status',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas'],
        params: reserva_params_schema,
        body: change_reserva_status_body_schema,
        response: {
          200: reserva_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
          422: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const updated = await alterar_status_use_case.execute({
          reserva_id: request.params.id,
          hotel_id: request.user.hotelId,
          status_novo: request.body.status,
          user_id: request.user.sub,
        })
        return reply.status(200).send(reserva_to_response(updated))
      } catch (err) {
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof ReservaTransicaoInvalidaError) {
          return reply.status(422).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 7. Equipe salva/edita ficha do hóspede
  app.put(
    '/reservas/:id/hospedes/:posicao',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas - FNRH'],
        params: reserva_hospede_params_schema,
        body: save_ficha_body_schema,
        response: {
          200: hospede_response_schema,
          400: error_response_schema,
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const hospede = await salvar_ficha_use_case.execute({
          reserva_id: request.params.id,
          hotel_id: request.user.hotelId,
          posicao: request.params.posicao,
          dados: request.body,
        })
        return reply.status(200).send({
          id: hospede.id,
          posicao: hospede.posicao,
          ficha_status: hospede.ficha_status,
          preenchido_por: hospede.preenchido_por,
          preenchido_em: hospede.preenchido_em
            ? hospede.preenchido_em.toISOString()
            : null,
          nome_completo: hospede.nome_completo,
          nacionalidade: hospede.nacionalidade,
          data_nascimento: hospede.data_nascimento,
          sexo: hospede.sexo,
          profissao: hospede.profissao,
          tipo_documento: hospede.tipo_documento,
          numero_documento: hospede.numero_documento,
          logradouro: hospede.logradouro,
          numero_endereco: hospede.numero_endereco,
          complemento: hospede.complemento,
          bairro: hospede.bairro,
          cidade: hospede.cidade,
          estado: hospede.estado,
          cep: hospede.cep,
          pais_residencia: hospede.pais_residencia,
          telefone: hospede.telefone,
          email: hospede.email,
          motivo_viagem: hospede.motivo_viagem,
          meio_transporte: hospede.meio_transporte,
          procedencia: hospede.procedencia,
          proximo_destino: hospede.proximo_destino,
          responsavel_posicao: hospede.responsavel_posicao,
        })
      } catch (err) {
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 8. Regenerar link FNRH
  app.post(
    '/reservas/:id/link-fnrh/regenerar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas - FNRH'],
        params: reserva_params_schema,
        response: {
          200: z.object({ url_token: z.string(), ativo: z.boolean() }),
          401: error_response_schema,
          404: error_response_schema,
          422: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const info = await link_fnrh_use_case.regenerar(
          request.params.id,
          request.user.hotelId
        )
        return reply.status(200).send(info)
      } catch (err) {
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(422).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 9. Desativar link FNRH
  app.post(
    '/reservas/:id/link-fnrh/desativar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Reservas - FNRH'],
        params: reserva_params_schema,
        response: {
          200: z.object({ url_token: z.string(), ativo: z.boolean() }),
          401: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const info = await link_fnrh_use_case.desativar(
          request.params.id,
          request.user.hotelId
        )
        return reply.status(200).send(info)
      } catch (err) {
        if (err instanceof ReservaNotFoundError) {
          return reply.status(404).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )
}
