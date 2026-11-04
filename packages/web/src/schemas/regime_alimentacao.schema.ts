import { z } from 'zod'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const regimeAlimentacaoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),
  descricao: z.string().trim().max(1000).optional().default(''),
  cor_pulseira: z
    .string()
    .trim()
    .regex(
      HEX_COLOR_REGEX,
      'A cor da pulseira deve ser um hexadecimal válido (ex: #3B82F6).'
    ),
  ativo: z.boolean().default(true),
})

export type RegimeAlimentacaoFormData = z.infer<typeof regimeAlimentacaoSchema>
