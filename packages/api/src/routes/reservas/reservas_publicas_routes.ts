import { z } from 'zod'
import {
  FnrhLinkInvalidoError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import {
  HotelRepository,
  ReservaHospedeRepository,
  ReservaRepository,
} from '@/core/repositories'
import { BuscarFnrhPublicaUseCase } from '@/core/usecases/reservas/buscar_fnrh_publica_use_case'
import { EnviarFnrhUseCase } from '@/core/usecases/reservas/enviar_fnrh_use_case'
import { SalvarFichaPublicaUseCase } from '@/core/usecases/reservas/salvar_ficha_publica_use_case'
import { db } from '@/lib/prisma'
import {
  error_response_schema,
  fnrh_publica_view_schema,
  hospede_response_schema,
  save_ficha_body_schema,
  token_publico_hospede_params_schema,
  token_publico_params_schema,
} from '@/schemas/reservas/reservas_schema'
import type { FastifyTypedInstance } from '@/types/fastify'

export async function reservas_publicas_routes(app: FastifyTypedInstance) {
  const reservas_repo = new ReservaRepository(db)
  const hospedes_repo = new ReservaHospedeRepository(db)
  const hotels_repo = new HotelRepository(db)

  const buscar_fnrh_use_case = new BuscarFnrhPublicaUseCase(
    reservas_repo,
    hotels_repo
  )
  const salvar_ficha_publica_use_case = new SalvarFichaPublicaUseCase(
    reservas_repo,
    hospedes_repo
  )
  const enviar_fnrh_use_case = new EnviarFnrhUseCase(
    reservas_repo,
    hospedes_repo
  )

  // 1. Visualizar formulário público da FNRH
  app.get(
    '/reservas/publico/:token',
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['Reservas Públicas - FNRH'],
        params: token_publico_params_schema,
        response: {
          200: fnrh_publica_view_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const view = await buscar_fnrh_use_case.execute(request.params.token)
        return reply.status(200).send(view)
      } catch (err) {
        if (err instanceof FnrhLinkInvalidoError) {
          return reply.status(404).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 2. Salvar ficha de hóspede (rascunho ou concluída)
  app.put(
    '/reservas/publico/:token/hospedes/:posicao',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['Reservas Públicas - FNRH'],
        params: token_publico_hospede_params_schema,
        body: save_ficha_body_schema,
        response: {
          200: hospede_response_schema,
          400: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const hospede = await salvar_ficha_publica_use_case.execute({
          token: request.params.token,
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
          responsavel_posicao: hospede.responsavel_posicao,
        })
      } catch (err) {
        if (err instanceof FnrhLinkInvalidoError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )

  // 3. Enviar ao hotel (concluir todas as fichas)
  app.post(
    '/reservas/publico/:token/enviar',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['Reservas Públicas - FNRH'],
        params: token_publico_params_schema,
        response: {
          200: z.object({ fnrh_enviada_em: z.string() }),
          400: error_response_schema,
          404: error_response_schema,
        },
      },
    },
    async (request, reply) => {
      try {
        const resultado = await enviar_fnrh_use_case.execute(
          request.params.token
        )
        return reply.status(200).send(resultado)
      } catch (err) {
        if (err instanceof FnrhLinkInvalidoError) {
          return reply.status(404).send({ message: err.message })
        }
        if (err instanceof ReservaValidationError) {
          return reply.status(400).send({ message: err.message })
        }
        return reply.status(500).send({ message: 'Erro interno do servidor.' })
      }
    }
  )
}
