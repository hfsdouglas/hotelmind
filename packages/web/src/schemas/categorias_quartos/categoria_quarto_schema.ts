import { z } from 'zod'

export const categoriaQuartoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Nome obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  status: z.enum(['S', 'N']).default('S'),
})

export type CategoriaQuartoFormData = z.infer<typeof categoriaQuartoSchema>
