import { z } from 'zod'

export const rotaCreateSchema = z.object({
  modulo: z.string().trim().min(1, 'Módulo é obrigatório'),
  recurso: z.string().trim().min(1, 'Recurso é obrigatório'),
  rota: z.string().trim().min(1, 'Rota é obrigatória'),
  icone: z.string().trim().optional(),
  ordem: z.coerce.number().int().default(0),
  ativo: z.boolean().default(true),
})

export const rotaUpdateSchema = z.object({
  modulo: z.string().trim().min(1, 'Módulo é obrigatório'),
  recurso: z.string().trim().min(1, 'Recurso é obrigatório'),
  rota: z.string().trim().min(1, 'Rota é obrigatória'),
  icone: z.string().trim().optional(),
  ordem: z.coerce.number().int(),
  ativo: z.boolean(),
})

export type RotaCreateFormData = z.infer<typeof rotaCreateSchema>
export type RotaUpdateFormData = z.infer<typeof rotaUpdateSchema>
