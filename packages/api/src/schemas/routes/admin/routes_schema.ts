import { z } from 'zod'

const rota_shape = z.object({
  id: z.string(),
  modulo: z.string(),
  recurso: z.string(),
  rota: z.string(),
  icone: z.string().nullable(),
  ordem: z.number(),
  ativo: z.boolean(),
})

export const route_body_schema = z.object({
  modulo: z.string().min(1),
  recurso: z.string().min(1),
  rota: z.string().min(1),
  icone: z.string().nullable().optional(),
  ordem: z.number().int().default(0),
  ativo: z.boolean().default(true),
})

export const route_update_schema = route_body_schema.partial()

export const routes_list_schema = z.object({
  data: z.array(rota_shape),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const route_response_schema = rota_shape

export const hotel_routes_response_schema = z.array(rota_shape)

export const hotel_routes_body_schema = z.object({
  rota_ids: z.array(z.string()),
})

export const error_schema = z.object({ message: z.string() })
