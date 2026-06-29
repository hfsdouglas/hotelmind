import { z } from 'zod'

export const login_body_schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export const login_response_schema = z.object({
  user: z.object({
    id: z.string(),
    nome_completo: z.string(),
    email: z.string(),
    hotel_id: z.string(),
    grupos_ids: z.string().nullable().optional(),
  }),
  hotel: z.object({
    id: z.string(),
    nome_hotel: z.string(),
    nome_fantasia: z.string(),
    cnpj: z.string(),
  }),
  message: z.string(),
  rotas: z.array(
    z.object({
      modulo: z.string(),
      recurso: z.string(),
      rota: z.string(),
      icone: z.string().nullable(),
      ordem: z.number(),
    }),
  ),
})

export const login_error_schema = z.object({
  message: z.string(),
})

export type LoginBodyInput = z.infer<typeof login_body_schema>
