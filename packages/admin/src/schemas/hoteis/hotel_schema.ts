import { z } from 'zod'

export const hotelCreateSchema = z.object({
  nome_hotel: z.string().trim().min(2, 'Nome do hotel deve ter pelo menos 2 caracteres'),
  razao_social: z.string().trim().min(2, 'Razão social deve ter pelo menos 2 caracteres'),
  nome_fantasia: z.string().trim().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
  cnpj: z.string().trim().length(14, 'CNPJ deve ter 14 dígitos'),
  email_comercial: z.string().trim().email('E-mail comercial inválido'),
  telefone_comercial: z
    .string()
    .trim()
    .min(10, 'Telefone deve ter entre 10 e 11 dígitos')
    .max(11, 'Telefone deve ter entre 10 e 11 dígitos'),
  website: z.string().trim().optional(),
})

export const hotelUpdateSchema = hotelCreateSchema.extend({
  status: z.enum(['S', 'N']),
})

export type HotelCreateFormData = z.infer<typeof hotelCreateSchema>
export type HotelUpdateFormData = z.infer<typeof hotelUpdateSchema>
