import { z } from 'zod'

export const login_body_schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const login_response_schema = z.object({
  admin: z.object({
    id: z.string(),
    nome_completo: z.string(),
    email: z.string(),
  }),
  message: z.string(),
})

export const me_response_schema = z.object({
  admin: z.object({
    id: z.string(),
    nome_completo: z.string(),
    email: z.string(),
  }),
})

export const error_schema = z.object({ message: z.string() })
export const logout_response_schema = z.object({ message: z.string() })
