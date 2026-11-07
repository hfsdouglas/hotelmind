import { z } from 'zod'
import {
  is_valid_iso_date,
  normalize_datas,
  normalize_valor_diaria,
} from '@/core/entities/tarifario'

const iso_date_schema = z
  .string()
  .trim()
  .refine(is_valid_iso_date, 'Data inválida. Utilize o formato YYYY-MM-DD.')

const datas_array_schema = z
  .array(iso_date_schema)
  .min(1, 'Selecione ao menos uma data no calendário.')
  .transform(datas => normalize_datas(datas))

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

const regime_alimentacao_resumo_schema = z.object({
  id: z.string(),
  titulo: z.string(),
  cor_pulseira: z.string(),
})

const parceiro_resumo_schema = z.object({
  id: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string().nullable().optional(),
})

export const tarifario_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  parceiro_id: z.string().nullable(),
  categoria_quarto_id: z.string().optional(),
  categoria_quarto_ids: z.array(z.string()),
  regime_alimentacao_id: z.string(),
  nome: z.string(),
  datas: z.array(z.string()),
  valor_diaria: z.string(),
  minimo_diarias: z.number().int().default(1),
  ativo: z.boolean(),
  parceiro: parceiro_resumo_schema.nullable().optional(),
  categoria_quarto: categoria_resumo_schema.optional(),
  categorias: z.array(categoria_resumo_schema),
  regime_alimentacao: regime_alimentacao_resumo_schema,
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
      'O limite deve ser 25, 50, 100 ou 250.'
    )
    .default(25),
  busca: z.string().trim().min(1).optional(),
  parceiro_id: z.string().optional(),
  categoria_quarto_id: z
    .string()
    .transform(value => value.split(',').filter(Boolean))
    .optional(),
  regime_alimentacao_id: z.string().uuid().optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform(value => value === 'true')
    .optional(),
})

export const create_tarifario_body_schema = z
  .object({
    categoria_quarto_id: z.string().trim().min(1).optional(),
    categoria_quarto_ids: z
      .array(z.string().trim().min(1))
      .min(1, 'Selecione ao menos uma categoria de quarto.')
      .optional(),
    regime_alimentacao_id: z.string().uuid('Informe o regime de alimentação.'),
    parceiro_id: z.string().uuid().nullable().optional(),
    nome: z
      .string()
      .trim()
      .min(1, 'O nome do tarifário é obrigatório.')
      .max(100, 'O nome do tarifário deve ter no máximo 100 caracteres.'),
    datas: datas_array_schema,
    valor_diaria: valor_diaria_schema,
    minimo_diarias: z.coerce
      .number()
      .int('A quantidade mínima de diárias deve ser um número inteiro.')
      .min(1, 'A quantidade mínima de diárias deve ser no mínimo 1.')
      .optional()
      .default(1),
    ativo: z.boolean().optional().default(true),
  })
  .refine(
    data => {
      const has_array = (data.categoria_quarto_ids?.length ?? 0) > 0
      const has_single = !!data.categoria_quarto_id
      return has_array || has_single
    },
    {
      message: 'Selecione ao menos uma categoria de quarto.',
      path: ['categoria_quarto_ids'],
    }
  )
  .transform(data => {
    const ids =
      data.categoria_quarto_ids ??
      (data.categoria_quarto_id ? [data.categoria_quarto_id] : [])
    const unique_ids = Array.from(new Set(ids.filter(Boolean)))
    return {
      ...data,
      categoria_quarto_id: data.categoria_quarto_id ?? unique_ids[0],
      categoria_quarto_ids: unique_ids,
    }
  })

export const update_tarifario_body_schema = z
  .object({
    categoria_quarto_id: z.string().trim().min(1).optional(),
    categoria_quarto_ids: z
      .array(z.string().trim().min(1))
      .min(1, 'Selecione ao menos uma categoria de quarto.')
      .optional(),
    regime_alimentacao_id: z
      .string()
      .uuid('Informe o regime de alimentação.')
      .optional(),
    parceiro_id: z.string().uuid().nullable().optional(),
    nome: z
      .string()
      .trim()
      .min(1, 'O nome do tarifário é obrigatório.')
      .max(100, 'O nome do tarifário deve ter no máximo 100 caracteres.')
      .optional(),
    datas: datas_array_schema.optional(),
    valor_diaria: valor_diaria_schema.optional(),
    minimo_diarias: z.coerce
      .number()
      .int('A quantidade mínima de diárias deve ser um número inteiro.')
      .min(1, 'A quantidade mínima de diárias deve ser no mínimo 1.')
      .optional(),
    ativo: z.boolean().optional(),
  })
  .transform(data => {
    if (data.categoria_quarto_ids) {
      const unique_ids = Array.from(
        new Set(data.categoria_quarto_ids.filter(Boolean))
      )
      return {
        ...data,
        categoria_quarto_ids: unique_ids,
        categoria_quarto_id: data.categoria_quarto_id ?? unique_ids[0],
      }
    }
    if (data.categoria_quarto_id) {
      return {
        ...data,
        categoria_quarto_ids: [data.categoria_quarto_id],
      }
    }
    return data
  })

export const calendario_tarifarios_query_schema = z
  .object({
    categoria_quarto_id: z
      .string()
      .trim()
      .min(1, 'A categoria de quarto é obrigatória.'),
    parceiro_id: z.string().optional(),
    data_inicio: iso_date_schema.optional(),
    data_fim: iso_date_schema.optional(),
  })
  .refine(
    data => {
      if (data.data_inicio && data.data_fim) {
        return data.data_inicio <= data.data_fim
      }
      return true
    },
    {
      message: 'A data de início deve ser anterior ou igual à data de término.',
      path: ['data_fim'],
    }
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
  categoria_quarto_ids: z.array(z.string()).optional(),
  parceiro_id: z.string().nullable().optional(),
  nome: z.string(),
  datas: z.array(z.string()),
  valor_diaria: z.string(),
  minimo_diarias: z.number().int().optional(),
  ativo: z.boolean(),
})

export const calendario_tarifarios_response_schema = z.object({
  data: z.array(periodo_calendario_schema),
})

export const error_response_schema = z.object({
  message: z.string(),
})
