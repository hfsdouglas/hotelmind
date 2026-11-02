import { z } from 'zod'

export const list_categorias_quartos_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(50),
  busca: z.string().optional(),
  status: z.enum(['S', 'N']).optional(),
  direcao: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const create_categoria_quarto_body_schema = z.object({
  nome: z.string().trim().min(1).max(100),
  status: z.enum(['S', 'N']).optional().default('S'),
})

export const update_categoria_quarto_body_schema = create_categoria_quarto_body_schema.extend({ status: z.enum(['S', 'N']) })

const categoria_quarto_schema = z.object({
  id: z.string(), hotel_id: z.string(), nome: z.string(), status: z.enum(['S', 'N']), created_at: z.date(), updated_at: z.date(),
})

export const list_categorias_quartos_response_schema = z.object({
  data: z.array(categoria_quarto_schema),
  meta: z.object({ pagina: z.number(), limite: z.number(), total: z.number(), ultima_pagina: z.number() }),
})

export const categoria_quarto_response_schema = categoria_quarto_schema
export const error_response_schema = z.object({ message: z.string() })
