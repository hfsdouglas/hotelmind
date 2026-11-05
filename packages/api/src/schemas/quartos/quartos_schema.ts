import { TIPOS_CAMA } from '@hotelmind/contracts'
import { z } from 'zod'

const cama_schema = z.object({
  tipo: z.enum(TIPOS_CAMA),
  quantidade: z.number().int().positive(),
})
const categoria_resumo_schema = z.object({
  id: z.string(),
  nome: z.string(),
  status: z.enum(['S', 'N']),
})
const quarto_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  categoria_id: z.string(),
  identificacao: z.string(),
  descricao: z.string().nullable(),
  limite_hospedes: z.number().int().positive(),
  status: z.enum(['S', 'N']),
  categoria: categoria_resumo_schema,
  camas: z.array(cama_schema.extend({ id: z.string() })),
  created_at: z.date(),
  updated_at: z.date(),
})

export const list_quartos_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce
    .number()
    .int()
    .refine(
      value => [25, 50, 100, 250].includes(value),
      'O limite deve ser 25, 50, 100 ou 250.'
    )
    .default(25),
  busca: z.string().trim().min(1).optional(),
  categoria_id: z
    .string()
    .transform(value => value.split(',').filter(Boolean))
    .optional(),
  direcao: z.enum(['asc', 'desc']).optional().default('asc'),
  status: z.enum(['S', 'N']).optional(),
})

export const create_quarto_body_schema = z.object({
  categoria_id: z.string().min(1),
  identificacao: z
    .string()
    .trim()
    .regex(/^\d+$/, 'A identificação deve conter apenas números.')
    .max(30),
  descricao: z.string().trim().optional(),
  limite_hospedes: z.number().int().positive(),
  camas: z
    .array(cama_schema)
    .min(1)
    .superRefine((beds, ctx) => {
      const types = new Set<string>()
      beds.forEach((bed, index) => {
        if (types.has(bed.tipo))
          ctx.addIssue({
            code: 'custom',
            path: [index, 'tipo'],
            message: 'Tipo de cama duplicado.',
          })
        types.add(bed.tipo)
      })
    }),
})

export const update_quarto_body_schema = create_quarto_body_schema.extend({
  status: z.enum(['S', 'N']),
})

export const list_quartos_response_schema = z.object({
  data: z.array(quarto_schema),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})
export const quarto_response_schema = quarto_schema
export const error_response_schema = z.object({ message: z.string() })
