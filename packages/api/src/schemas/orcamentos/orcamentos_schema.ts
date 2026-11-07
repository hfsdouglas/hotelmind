import { z } from 'zod'
import { create_lead_body_schema } from '@/schemas/leads/leads_schema'

export const orcamento_params_schema = z.object({
  id: z.string().uuid(),
})

export const orcamento_publico_params_schema = z.object({
  token: z.string().min(1),
})

export const list_orcamentos_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(25),
  busca: z.string().trim().min(1).optional(),
  parceiro_id: z.string().optional(),
  regime_alimentacao_id: z.string().uuid().optional(),
  categoria_quarto_id: z.string().uuid().optional(),
  status: z.enum(['pendente', 'aprovado', 'cancelado', 'expirado']).optional(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export const create_orcamento_body_schema = z.object({
  regime_alimentacao_id: z
    .string()
    .uuid('Selecione um regime de alimentação válido.'),
  categoria_quarto_id: z
    .string()
    .uuid('Selecione uma categoria de acomodação válida.'),
  parceiro_id: z.string().uuid().nullable().optional(),
  check_in: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de check-in deve estar no formato YYYY-MM-DD.'
    ),
  check_out: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Data de check-out deve estar no formato YYYY-MM-DD.'
    ),
  quantidade_adultos: z.coerce
    .number()
    .int()
    .min(1, 'Informe pelo menos 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  quantidade_pets: z.coerce.number().int().min(0).default(0),
  observacoes: z.string().trim().max(2000).nullable().optional(),
  cupom_desconto: z.string().trim().max(50).nullable().optional(),
  lead_id: z.string().uuid().optional(),
  lead: create_lead_body_schema.optional(),
})

export const update_orcamento_body_schema = z.object({
  regime_alimentacao_id: z.string().uuid().optional(),
  categoria_quarto_id: z.string().uuid().optional(),
  parceiro_id: z.string().uuid().nullable().optional(),
  check_in: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  check_out: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  quantidade_adultos: z.coerce.number().int().min(1).optional(),
  quantidade_criancas: z.coerce.number().int().min(0).optional(),
  quantidade_pets: z.coerce.number().int().min(0).optional(),
  observacoes: z.string().trim().max(2000).nullable().optional(),
  cupom_desconto: z.string().trim().max(50).nullable().optional(),
  status: z.enum(['pendente', 'aprovado', 'cancelado', 'expirado']).optional(),
  lead: z
    .object({
      nome: z.string().trim().min(1).optional(),
      telefone: z.string().trim().min(8).optional(),
      email: z.string().trim().email().optional(),
    })
    .optional(),
})

export const noite_calculada_schema = z.object({
  data: z.string(),
  tarifario_id: z.string(),
  tarifario_nome: z.string(),
  valor_diaria: z.string(),
})

export const orcamento_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  lead_id: z.string(),
  parceiro_id: z.string().nullable().optional(),
  regime_alimentacao_id: z.string(),
  categoria_quarto_id: z.string(),
  check_in: z.string(),
  check_out: z.string(),
  quantidade_adultos: z.number(),
  quantidade_criancas: z.number(),
  quantidade_pets: z.number(),
  valor_total: z.string(),
  detalhamento_noites: z.array(noite_calculada_schema),
  token_publico: z.string(),
  status: z.string(),
  observacoes: z.string().nullable().optional(),
  cupom_desconto: z.string().nullable().optional(),
  lead: z
    .object({
      id: z.string(),
      nome: z.string(),
      telefone: z.string(),
      email: z.string(),
    })
    .optional(),
  parceiro: z
    .object({
      id: z.string(),
      razao_social: z.string(),
      nome_fantasia: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  regime_alimentacao: z
    .object({
      id: z.string(),
      titulo: z.string(),
      cor_pulseira: z.string(),
    })
    .optional(),
  categoria_quarto: z
    .object({
      id: z.string(),
      nome: z.string(),
    })
    .optional(),
  criado_em: z.string(),
  atualizado_em: z.string(),
})

export const list_orcamentos_response_schema = z.object({
  data: z.array(orcamento_response_schema),
  meta: z.object({
    total: z.number(),
    pagina: z.number(),
    limite: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const orcamento_publico_response_schema = z.object({
  token_publico: z.string(),
  hotel_nome: z.string(),
  hotel_nome_fantasia: z.string().optional(),
  hotel_telefone: z.string().optional(),
  hotel_celular: z.string().optional(),
  hotel_email: z.string().optional(),
  hotel_endereco: z
    .object({
      rua: z.string(),
      numero: z.string(),
      bairro: z.string(),
      complemento: z.string().nullable().optional(),
      cep: z.string(),
      cidade: z.string(),
      estado: z.string(),
    })
    .nullable()
    .optional(),
  check_in: z.string(),
  check_out: z.string(),
  total_noites: z.number(),
  quantidade_adultos: z.number(),
  quantidade_criancas: z.number(),
  quantidade_pets: z.number(),
  regime_alimentacao: z.object({
    nome: z.string(),
    cor: z.string(),
    descricao: z.string().nullable().optional(),
  }),
  categoria_quarto: z.object({
    nome: z.string(),
  }),
  lead_nome: z.string(),
  detalhamento_noites: z.array(noite_calculada_schema),
  valor_total: z.string(),
  status: z.string(),
  cupom_desconto: z.string().nullable().optional(),
  criado_em: z.string(),
})

export const error_response_schema = z.object({
  message: z.string(),
})
