import { z } from 'zod'
import { is_valid_iso_date, normalize_valor_diaria } from '@/core/entities/tarifario'

const iso_date_schema = z
  .string()
  .trim()
  .refine(is_valid_iso_date, 'Data inválida. Utilize o formato YYYY-MM-DD.')

const valor_diaria_schema = z
  .union([z.string(), z.number()])
  .transform((val, ctx) => {
    try {
      return normalize_valor_diaria(val)
    } catch {
      ctx.addIssue({
        code: 'custom',
        message:
          'O valor da diária deve ser numérico maior ou igual a zero com até duas casas decimais.',
      })
      return z.NEVER
    }
  })

const categoria_resumo_schema = z.object({
  id: z.string(),
  nome: z.string(),
  status: z.enum(['S', 'N']),
})

export const tarifario_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  categoria_quarto_id: z.string(),
  nome: z.string(),
  data_inicio: z.string(),
  data_fim: z.string(),
  valor_diaria: z.string(),
  ativo: z.boolean(),
  categoria_quarto: categoria_resumo_schema,
  criado_em: z.string(),
  atualizado_em: z.string(),
})

export const list_tarifarios_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce
    .number()
    .int()
    .refine(
      value => [25, 50, 100, 250].includes(value),
      'O limite deve ser 25, 50, 100 ou 250.',
    )
    .default(25),
  busca: z.string().trim().min(1).optional(),
  categoria_quarto_id: z
    .string()
    .transform(value => value.split(',').filter(Boolean))
    .optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform(value => value === 'true')
    .optional(),
})

export const create_tarifario_body_schema = z
  .object({
    categoria_quarto_id: z
      .string()
      .trim()
      .min(1, 'A categoria de quarto é obrigatória.'),
    nome: z
      .string()
      .trim()
      .min(1, 'O nome do tarifário é obrigatório.')
      .max(100, 'O nome do tarifário deve ter no máximo 100 caracteres.'),
    data_inicio: iso_date_schema,
    data_fim: iso_date_schema,
    valor_diaria: valor_diaria_schema,
    ativo: z.boolean().optional().default(true),
  })
  .refine(data => data.data_inicio < data.data_fim, {
    message: 'A data de início deve ser anterior à data de término.',
    path: ['data_fim'],
  })

export const update_tarifario_body_schema = z
  .object({
    categoria_quarto_id: z
      .string()
      .trim()
      .min(1, 'A categoria de quarto é obrigatória.')
      .optional(),
    nome: z
      .string()
      .trim()
      .min(1, 'O nome do tarifário é obrigatório.')
      .max(100, 'O nome do tarifário deve ter no máximo 100 caracteres.')
      .optional(),
    data_inicio: iso_date_schema.optional(),
    data_fim: iso_date_schema.optional(),
    valor_diaria: valor_diaria_schema.optional(),
    ativo: z.boolean().optional(),
  })
  .refine(
    data => {
      if (data.data_inicio && data.data_fim) {
        return data.data_inicio < data.data_fim
      }
      return true
    },
    {
      message: 'A data de início deve ser anterior à data de término.',
      path: ['data_fim'],
    },
  )

export const calendario_tarifarios_query_schema = z
  .object({
    categoria_quarto_id: z
      .string()
      .trim()
      .min(1, 'A categoria de quarto é obrigatória.'),
    data_inicio: iso_date_schema.optional(),
    data_fim: iso_date_schema.optional(),
  })
  .refine(
    data => {
      if (data.data_inicio && data.data_fim) {
        return data.data_inicio < data.data_fim
      }
      return true
    },
    {
      message: 'A data de início deve ser anterior à data de término.',
      path: ['data_fim'],
    },
  )

export const list_tarifarios_response_schema = z.object({
  data: z.array(tarifario_response_schema),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const periodo_calendario_schema = z.object({
  id: z.string(),
  categoria_quarto_id: z.string(),
  nome: z.string(),
  data_inicio: z.string(),
  data_fim: z.string(),
  valor_diaria: z.string(),
  ativo: z.boolean(),
})

export const calendario_tarifarios_response_schema = z.object({
  data: z.array(periodo_calendario_schema),
})

export const error_response_schema = z.object({
  message: z.string(),
})
