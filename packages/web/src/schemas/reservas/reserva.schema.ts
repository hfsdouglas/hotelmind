import { z } from 'zod'

export const novaReservaFormSchema = z.object({
  check_in: z.string().min(10, 'Selecione a data de check-in.'),
  check_out: z.string().min(10, 'Selecione a data de check-out.'),
  quantidade_adultos: z.coerce.number().int().min(1, 'Mínimo de 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  regime_alimentacao_id: z.string().uuid('Selecione um regime de alimentação.'),
  quarto_id: z.string().uuid('Selecione uma suíte disponível.'),
  titular_nome: z
    .string()
    .trim()
    .min(2, 'O nome do titular deve ter pelo menos 2 caracteres.')
    .max(150),
  titular_telefone: z.string().trim().max(30).optional().or(z.literal('')),
  titular_email: z
    .string()
    .trim()
    .email('E-mail inválido.')
    .max(150)
    .optional()
    .or(z.literal('')),
  parceiro_comercial_id: z.string().uuid().optional().or(z.literal('')),
  observacoes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export type NovaReservaFormData = z.infer<typeof novaReservaFormSchema>
