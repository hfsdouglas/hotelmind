import { z } from 'zod'

export const create_usuario_body_schema = z.object({
  nome_completo: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
  nascimento: z.coerce.date(),
  genero: z.string().min(1),
  celular: z.string().min(10).max(11),
  cpf: z.string().length(11),
  rg: z.string().nullable().optional(),
  grupos_ids: z.string().nullable().optional(),
})

export const update_usuario_body_schema = z.object({
  nome_completo: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(8).optional(),
  nascimento: z.coerce.date().optional(),
  genero: z.string().min(1).optional(),
  celular: z.string().min(10).max(11).optional(),
  cpf: z.string().length(11).optional(),
  rg: z.string().nullable().optional(),
  grupos_ids: z.string().nullable().optional(),
})

export const usuario_response_schema = z.object({
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

export type CreateUsuarioBodyInput = z.infer<typeof create_usuario_body_schema>
export type UpdateUsuarioBodyInput = z.infer<typeof update_usuario_body_schema>
