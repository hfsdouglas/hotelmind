import { z } from 'zod'

export const orcamentoFormSchema = z.object({
  check_in: z.string().min(10, 'A data de check-in é obrigatória.'),
  check_out: z.string().min(10, 'A data de check-out é obrigatória.'),
  quantidade_adultos: z.coerce.number().int().min(1, 'Mínimo de 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  quantidade_pets: z.coerce.number().int().min(0).default(0),
  regime_alimentacao_id: z
    .string()
    .min(1, 'Selecione o regime de alimentação.'),
  categoria_quarto_id: z
    .string()
    .min(1, 'Selecione a categoria de acomodação.'),
  lead_nome: z.string().trim().min(1, 'O nome do lead é obrigatório.'),
  lead_telefone: z.string().trim().min(8, 'Telefone/WhatsApp inválido.'),
  lead_email: z.string().trim().email('E-mail inválido.'),
  observacoes: z.string().optional(),
})

export type OrcamentoFormData = z.infer<typeof orcamentoFormSchema>
