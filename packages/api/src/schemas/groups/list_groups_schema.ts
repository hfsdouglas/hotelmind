import { z } from 'zod'

export const list_groups_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).optional().default('asc'),
  status: z.string().optional(),
})

const group_item_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  grupo: z.string(),
  descricao: z.string().nullable(),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export const list_groups_response_schema = z.object({
  data: z.array(group_item_schema),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export type ListGroupsQueryInput = z.infer<typeof list_groups_query_schema>
