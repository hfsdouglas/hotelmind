import { z } from 'zod'

export const list_usuarios_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(50),
  busca: z.string().optional(),
  ordenar_por: z.string().optional(),
  direcao: z.enum(['asc', 'desc']).optional().default('asc'),
})

const usuario_item_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  nome_completo: z.string(),
  email: z.string(),
  nascimento: z.date(),
  genero: z.string(),
  celular: z.string(),
  cpf: z.string(),
  rg: z.string().nullable(),
  grupos_ids: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
})

export const list_usuarios_response_schema = z.object({
  data: z.array(usuario_item_schema),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export type ListUsuariosQueryInput = z.infer<typeof list_usuarios_query_schema>
