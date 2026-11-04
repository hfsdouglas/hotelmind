import { z } from 'zod'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const hex_color_schema = z
  .string()
  .trim()
  .regex(
    HEX_COLOR_REGEX,
    'A cor da pulseira deve ser um código hexadecimal válido (ex: #FF5733).'
  )
  .transform(val => val.toUpperCase())

export const list_regimes_alimentacao_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(25),
  busca: z.string().trim().min(1).optional(),
  ativo: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform(value => (typeof value === 'boolean' ? value : value === 'true'))
    .optional(),
})

export const create_regime_alimentacao_body_schema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  descricao: z.string().trim().max(1000).nullable().optional(),
  cor_pulseira: hex_color_schema,
  ativo: z.boolean().optional().default(true),
})

export const update_regime_alimentacao_body_schema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  descricao: z.string().trim().max(1000).nullable().optional(),
  cor_pulseira: hex_color_schema,
  ativo: z.boolean(),
})

export const regime_alimentacao_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  cor_pulseira: z.string(),
  ativo: z.boolean(),
  criado_em: z.date(),
  atualizado_em: z.date(),
})

export const list_regimes_alimentacao_response_schema = z.object({
  data: z.array(regime_alimentacao_response_schema),
  meta: z.object({
    total: z.number(),
    pagina: z.number(),
    limite: z.number(),
    ultima_pagina: z.number(),
    total_paginas: z.number().optional(),
  }),
})

export const error_response_schema = z.object({
  message: z.string(),
})
