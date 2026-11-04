import { z } from 'zod'

export const list_leads_query_schema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(250).default(25),
  busca: z.string().trim().min(1).optional(),
})

export const lead_params_schema = z.object({
  id: z.string().uuid(),
})

export const create_lead_body_schema = z.object({
  nome: z.string().trim().min(1, 'O nome é obrigatório.').max(150),
  telefone: z
    .string()
    .trim()
    .min(1, 'O telefone/WhatsApp é obrigatório.')
    .max(30),
  email: z.string().trim().email('E-mail inválido.').max(150),
})

export const update_lead_body_schema = z.object({
  nome: z.string().trim().min(1).max(150).optional(),
  telefone: z.string().trim().min(1).max(30).optional(),
  email: z.string().trim().email().max(150).optional(),
})

export const lead_response_schema = z.object({
  id: z.string(),
  hotel_id: z.string(),
  nome: z.string(),
  telefone: z.string(),
  email: z.string(),
  criado_em: z.string(),
  atualizado_em: z.string(),
})

export const list_leads_response_schema = z.object({
  data: z.array(lead_response_schema),
  meta: z.object({
    total: z.number(),
    pagina: z.number(),
    limite: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const error_response_schema = z.object({
  message: z.string(),
})
