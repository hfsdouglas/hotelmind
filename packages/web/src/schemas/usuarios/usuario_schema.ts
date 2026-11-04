import { z } from 'zod'

export const usuarioCreateSchema = z.object({
  nome_completo: z.string().trim().min(1, 'Nome obrigatório'),
  email: z.string().trim().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  nascimento: z.string().trim().min(1, 'Data obrigatória'),
  genero: z.string().trim().min(1, 'Gênero obrigatório'),
  celular: z
    .string()
    .trim()
    .min(10, 'Celular deve ter entre 10 e 11 dígitos')
    .max(11, 'Celular deve ter entre 10 e 11 dígitos'),
  cpf: z.string().trim().length(11, 'CPF deve ter 11 dígitos'),
  rg: z.string().trim().optional(),
  grupos_ids: z.string().optional().default(''),
})

export const usuarioUpdateSchema = z.object({
  nome_completo: z.string().trim().min(1, 'Nome obrigatório').optional(),
  email: z.string().trim().email('E-mail inválido').optional(),
  senha: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  nascimento: z.string().trim().optional(),
  genero: z.string().trim().optional(),
  celular: z
    .string()
    .trim()
    .min(10, 'Celular deve ter entre 10 e 11 dígitos')
    .max(11, 'Celular deve ter entre 10 e 11 dígitos')
    .optional(),
  cpf: z.string().trim().length(11, 'CPF deve ter 11 dígitos').optional(),
  rg: z.string().trim().optional(),
  grupos_ids: z.string().optional().default(''),
  status: z.enum(['S', 'N']).optional(),
})

export type UsuarioCreateFormData = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdateFormData = z.infer<typeof usuarioUpdateSchema>
