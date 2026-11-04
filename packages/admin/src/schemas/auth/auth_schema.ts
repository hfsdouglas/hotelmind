import { z } from 'zod'

export const login_schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export type LoginFormData = z.infer<typeof login_schema>
