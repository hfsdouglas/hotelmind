import { z } from 'zod'

export const administradorCreateSchema = z.object({
  nome_completo: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export const administradorUpdateSchema = z.object({
  nome_completo: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  status: z.enum(['S', 'N']),
})

export type AdministradorCreateFormData = z.infer<typeof administradorCreateSchema>
export type AdministradorUpdateFormData = z.infer<typeof administradorUpdateSchema>
