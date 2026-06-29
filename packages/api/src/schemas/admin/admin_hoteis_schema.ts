import { z } from 'zod'

const hotel_shape = z.object({
  id: z.string(),
  nome_hotel: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string(),
  cnpj: z.string(),
  email_comercial: z.string(),
  telefone_comercial: z.string(),
  website: z.string().nullable(),
})

export const admin_hotel_body_schema = z.object({
  nome_hotel: z.string().min(2),
  razao_social: z.string().min(2),
  nome_fantasia: z.string().min(2),
  cnpj: z.string().length(14),
  email_comercial: z.string().email(),
  telefone_comercial: z.string().min(10).max(11),
  website: z.string().nullable().optional(),
})

export const admin_hotel_update_schema = admin_hotel_body_schema.partial()

export const admin_hoteis_list_schema = z.object({
  data: z.array(hotel_shape),
  meta: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    ultima_pagina: z.number(),
  }),
})

export const admin_hotel_response_schema = hotel_shape
export const admin_error_schema = z.object({ message: z.string() })
