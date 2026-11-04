import { z } from 'zod'

export const grupoSchema = z.object({
  grupo: z.string().trim().min(1, 'Nome obrigatório').max(100),
  descricao: z.string().optional(),
  status: z.enum(['S', 'N']).default('S'),
})

export type GrupoFormData = z.infer<typeof grupoSchema>
