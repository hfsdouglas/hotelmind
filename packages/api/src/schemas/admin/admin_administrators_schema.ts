import { z } from 'zod'

const administrator_shape = z.object({
  id: z.string(),
  nome_completo: z.string(),
  email: z.string(),
  status: z.string(),
})

export const administrator_body_schema = z.object({
  nome_completo: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
  status: z.string().length(1).default('S'),
})

export const administrator_update_schema = z.object({
  nome_completo: z.string().min(2).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(8).optional(),
  status: z.string().length(1).optional(),
})

export const administrators_list_schema = z.object({
  data: z.array(administrator_shape),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const administrator_response_schema = administrator_shape
export const error_schema = z.object({ message: z.string() })
